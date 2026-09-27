const express = require("express");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// =====================================================
// PORT
// Works locally on 3000
// Works on Render using Render's PORT
// =====================================================

const PORT = process.env.PORT || 3000;


// =====================================================
// OPENAI
// =====================================================

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    express.json({
        limit: "1mb"
    })
);


// =====================================================
// SERVE HTML FROM /public
// =====================================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// =====================================================
// MONGOLIAN TTS API
// =====================================================

app.post("/api/tts", async (req, res) => {

    try {

        // =================================================
        // GET USER INPUT
        // =================================================

        const {
            text,
            voice = "marin",
            speed = 1,
            variant = "standard"
        } = req.body;


        // =================================================
        // VALIDATE TEXT
        // =================================================

        if (!text || !text.trim()) {

            return res.status(400).json({

                error:
                    "Please enter Mongolian text."

            });

        }


        // =================================================
        // LIMIT TEXT LENGTH
        // Helps control API usage
        // =================================================

        if (text.length > 5000) {

            return res.status(400).json({

                error:
                    "Text is too long. Please keep the text below 5000 characters."

            });

        }


        // =================================================
        // MONGOLIAN SPEAKING VARIANTS
        // =================================================

        const variants = {


            // -------------------------------------------------
            // STANDARD
            // -------------------------------------------------

            standard: `
Speak in clear, natural Standard Mongolian.

Use accurate Mongolian Cyrillic pronunciation.

Use natural Mongolian rhythm, intonation and pauses.

Do not sound like an English speaker reading Mongolian.

Keep the pronunciation natural and easy to understand.
`,


            // -------------------------------------------------
            // CONVERSATIONAL
            // -------------------------------------------------

            conversational: `
Speak natural conversational Mongolian.

Use a relaxed, warm and friendly Mongolian speaking style.

Use natural pauses and sentence rhythm.

Avoid an overly formal or robotic delivery.

Pronounce Mongolian Cyrillic naturally.

Sound like a person having a normal conversation in Mongolian.
`,


            // -------------------------------------------------
            // ULAANBAATAR
            // -------------------------------------------------

            ub: `
Speak Mongolian with a natural contemporary urban Mongolian
speaking style similar to everyday conversation in Ulaanbaatar.

Keep the pronunciation clearly Mongolian.

Use natural conversational rhythm and intonation.

Do not exaggerate the accent.

Avoid sounding like an English speaker reading Mongolian.

Keep the delivery authentic and natural.
`,


            // -------------------------------------------------
            // FORMAL
            // -------------------------------------------------

            formal: `
Speak clear and formal Standard Mongolian.

Use careful Mongolian pronunciation.

Use controlled pacing and professional intonation.

This should sound suitable for education, public information,
official communication or formal announcements.

Keep the delivery natural rather than robotic.
`,


            // -------------------------------------------------
            // NEWS
            // -------------------------------------------------

            news: `
Speak clear Standard Mongolian in the style of a professional
Mongolian news or public-information presenter.

Use precise pronunciation.

Use moderate pacing.

Use clear articulation.

Use professional but natural intonation.

Do not sound robotic.
`,


            // -------------------------------------------------
            // WARM
            // -------------------------------------------------

            warm: `
Speak natural Mongolian with a warm, friendly and approachable
speaking style.

Use gentle intonation.

Use natural pauses.

Use conversational rhythm.

The pronunciation should remain clearly Mongolian.

Sound welcoming and human.
`,


            // -------------------------------------------------
            // STORYTELLING
            // -------------------------------------------------

            storytelling: `
Speak natural Mongolian as an experienced storyteller.

Use expressive but authentic Mongolian intonation.

Use appropriate pauses and emphasis.

Make the story engaging and easy to follow.

Do not over-act.

Do not sound theatrical or robotic.
`,


            // -------------------------------------------------
            // EDUCATIONAL
            // -------------------------------------------------

            educational: `
Speak natural Mongolian suitable for teaching and education.

Pronounce every Mongolian word clearly.

Use moderate pacing.

Use clear articulation.

Use helpful pauses between important ideas.

Make the speech easy for students to understand.

Keep the tone natural and friendly.
`

        };


        // =================================================
        // SELECT VARIANT
        // =================================================

        const instructions =
            variants[variant] ||
            variants.standard;


        // =================================================
        // SERVER LOG
        // =================================================

        console.log("");

        console.log(
            "================================="
        );

        console.log(
            "🇲🇳 Mongolian TTS Request"
        );

        console.log(
            "Variant:",
            variant
        );

        console.log(
            "Voice:",
            voice
        );

        console.log(
            "Speed:",
            speed
        );

        console.log(
            "Characters:",
            text.length
        );

        console.log(
            "================================="
        );


        // =================================================
        // OPENAI TEXT TO SPEECH
        // =================================================

        const speech =
            await openai.audio.speech.create({

                model:
                    "gpt-4o-mini-tts",

                voice:
                    voice,

                input:
                    text,

                instructions:
                    instructions,

                response_format:
                    "mp3",

                speed:
                    Number(speed)

            });


        // =================================================
        // CONVERT RESPONSE TO BUFFER
        // =================================================

        const buffer =
            Buffer.from(
                await speech.arrayBuffer()
            );


        // =================================================
        // CHECK AUDIO
        // =================================================

        if (!buffer.length) {

            throw new Error(
                "OpenAI returned an empty audio file."
            );

        }


        // =================================================
        // SERVER LOG
        // =================================================

        console.log(
            "Audio generated:",
            buffer.length,
            "bytes"
        );


        // =================================================
        // AUDIO RESPONSE HEADERS
        // =================================================

        res.setHeader(
            "Content-Type",
            "audio/mpeg"
        );


        res.setHeader(
            "Content-Length",
            buffer.length
        );


        res.setHeader(
            "Content-Disposition",
            'inline; filename="mongolian-speech.mp3"'
        );


        // =================================================
        // SEND AUDIO
        // =================================================

        res.send(buffer);

    }


    catch (error) {

        // =================================================
        // ERROR HANDLING
        // =================================================

        console.error("");

        console.error(
            "================================="
        );

        console.error(
            "❌ OpenAI TTS ERROR"
        );

        console.error(
            error
        );

        console.error(
            "================================="
        );


        res.status(500).json({

            error:
                error.message ||
                "Failed to generate speech."

        });

    }

});


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "================================="
        );

        console.log(
            " 🇲🇳 Mongolian TTS Server"
        );

        console.log(
            "================================="
        );

        console.log("");

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Open http://localhost:${PORT}`
        );

        console.log("");

    }
);