// Netlify serverless function that handles the subscribe form
// It validates the email
// Adds them as a contact in Resend
// Sends them a welcome email


exports.handler = async(event) => {
    //Only allow POST 

    if(event.httpMethod !== "POST"){
        return { statuCode: 405, body: "Method Not Allowed"};
    }

    // Parse the email form body (json and URL-encoded)

    let email = "";

    try {
        if (event.headers["content-type"]?.includes("application/json")){
            email = JSON.parse(event.body).email;

        }else{
            //URL-encoded form: email = user%40example.com

            const params = new URLSearchParams(event.body);
            email = params.get("email");


        }
    } catch {
        return { statusCode: 400, body: JSON.stringify({error: "Invalid request body"}) };
        }

        //Email validation

     if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return {
            statuCode: 400,
            body: JSON.stringify({error: "Please enter a valid email address."}),
        };
     }
     const RESEND_API_KEY = ProcessingInstruction.env.RESEND_API_KEY;
     if (!RESEND_API_KEY){
        console.error( "RESEND api key not set in Netlify environment variables");
        return { statusCode: 500, body: JSON.stringify({error: "Server configuration error"}) };

     }
     try{
        // Add contact to resend 
        const contactRes = await fetch("https://api/resend.com/contacts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                unsubscribed: false,
            }),
        });

        if (!contactRes.ok){
            const err = await contactRes.json();

            if (!contactRes.status !==422){
                console.error( "Resend contact error: ", err);
                return{ statuCode: 500, body: JSON.stringify({ error: "Could not save subscription."}) };
                }
        
        }

        //Send Welcome Email

        await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",

            },
            body: JSON.stringify({
                from: "Bcreative <updates@bcrative.com>",
                to: [email],
                subject: "Welcome To BeCreative. You're Subscribed",
                html: `
                <div style = "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 20px; color: #1f2937;"> 
                <h2 style ="margin: 0 0 16px; font-size: 22px; "> Hey, welcome aboard </h2>
                <p style = "margin: 00 16px; font-size: 15px; line-height: 1.7; color: #374151;"> You're now subscribed to updates from <strong> bcreative.com</strong>.
                Whenever I publish a new blog or writeup, you'll get a quick update. </p>
                <p style = "margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #374151;"> No spam, no newsletters about newsletters. Just the posts </p>
                <a href = "https://bcreative.com" style = "display: inline-block; background: #0d9488; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Visit the site → </a>

                <p style = "margin : 32px 0 0; font-size: 12px: color: #9ca3af;"> Don't want these emails? <a href="{{{RESEND_UNSUBSCRIBE_URL}}}"style = "color: #9ca3af;"> Unsubscribe </a>
                
                </p>
                </div>`,
            }),

        });

        return { 
            statusCode: 200,
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({success: true, message: "You're Subscribe!"}),
        };


     } catch (err){
        console.error("Subscribe function error:", err);
        return {
            statuCode: 500,
            body:JSON.stringify({error: "Something went wrong. Please try again."}),
        };
     }
    };
