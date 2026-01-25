import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create client with user's auth token for user verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user's token using getClaims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const userId = claimsData.claims.sub;

    // Parse request body - only need message now
    const { message } = await req.json();
    
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate message length
    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message too long (max 2000 characters)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create service role client for database queries
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch relevant data from database
    const [resourcesRes, eventsRes, clubsRes] = await Promise.all([
      supabase.from("resources_public").select("id, title, description, category, tags").limit(15),
      supabase.from("events").select("id, title, description, start_time, location, tags").gte("start_time", new Date().toISOString()).order("start_time").limit(10),
      supabase.from("clubs").select("id, name, description, category, tags").limit(15),
    ]);

    const resources = resourcesRes.data || [];
    const events = eventsRes.data || [];
    const clubs = clubsRes.data || [];

    // Build context for AI
    const context = `You are RebelBot, a friendly and helpful AI assistant for UNLV students. You help students find campus resources, events, and clubs.

AVAILABLE RESOURCES:
${resources.map(r => `- ${r.title} (${r.category}): ${r.description || 'No description'} [ID: ${r.id}]`).join('\n')}

UPCOMING EVENTS:
${events.map(e => `- ${e.title} on ${new Date(e.start_time).toLocaleDateString()} at ${e.location || 'TBD'}: ${e.description || ''} [ID: ${e.id}]`).join('\n')}

STUDENT CLUBS:
${clubs.map(c => `- ${c.name} (${c.category}): ${c.description || 'No description'} [ID: ${c.id}]`).join('\n')}

RESPONSE GUIDELINES:
1. Be friendly, warm, and conversational. Use emojis sparingly.
2. When recommending resources/events/clubs, include their IDs so links can be generated.
3. Format your response as JSON with this structure:
   {
     "message": "Your conversational response here",
     "suggestedLinks": [
       {"title": "Resource Name", "type": "resource|event|club", "id": "uuid-here"}
     ]
   }
4. Limit suggested links to 3 most relevant items.
5. If the question is not about UNLV resources, politely redirect them to ask about campus services.
6. Keep responses concise but helpful.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: context },
          { role: "user", content: message.trim() },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "";

    // Parse AI response
    let parsedResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = { message: content, suggestedLinks: [] };
      }
    } catch {
      parsedResponse = { message: content, suggestedLinks: [] };
    }

    // Transform suggested links to include proper URLs
    const suggestedLinks = (parsedResponse.suggestedLinks || []).map((link: any) => ({
      title: String(link.title || ""),
      url: `/app/${String(link.type || "resource")}s/${String(link.id || "")}`,
    }));

    return new Response(
      JSON.stringify({
        message: parsedResponse.message,
        suggestedLinks,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        message: "I'm having trouble right now. Please try again in a moment!",
        suggestedLinks: [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
