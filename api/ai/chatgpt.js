const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const router = express.Router();

const BASE_CONVERSATION_URL = "https://chatgpt.com/backend-anon/f/conversation";
const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36";

function uuid() {
    return crypto.randomUUID();
}

function parseSSE(rawBody) {
    let fullText = "";
    let conversationId = null;
    let assistantMessageId = null;
    let currentEventType = "";

    const lines = rawBody.split(/\r?\n/);
    for (const line of lines) {
        const clean = line.trim();

        if (clean.startsWith("event: ")) {
            currentEventType = clean.slice(7).trim();
            continue;
        }

        if (!clean.startsWith("data: ")) continue;

        const dataStr = clean.slice(6).trim();
        if (!dataStr || dataStr === "[DONE]") continue;

        try {
            const obj = JSON.parse(dataStr);

            if (obj.type === "resume_conversation_token") {
                conversationId = obj.conversation_id;
            }

            if (obj.type === "delta" || currentEventType === "delta") {
                if (obj.o === "append" && obj.p === "/message/content/parts/0") {
                    fullText += obj.v;
                }
                if (obj.o === "patch" && Array.isArray(obj.v)) {
                    for (const patch of obj.v) {
                        if (patch.o === "append" && patch.p === "/message/content/parts/0") {
                            fullText += patch.v;
                        }
                    }
                }
                if (obj.v?.message?.author?.role === "assistant") {
                    assistantMessageId = obj.v.message.id;
                }
            }
        } catch {}
    }

    return {
        text: fullText,
        conversationId,
        assistantMessageId
    };
}

async function askChatGPT(prompt) {
    const messageId = uuid();
    const now = Date.now() / 1000;

    const payload = {
        action: "next",
        messages: [
            {
                id: messageId,
                author: { role: "user" },
                create_time: now,
                content: {
                    content_type: "text",
                    parts: [prompt]
                },
                metadata: {
                    selected_github_repos: [],
                    selected_all_github_repos: false,
                    serialization_metadata: { custom_symbol_offsets: [] }
                }
            }
        ],
        parent_message_id: "client-created-root",
        model: "auto",
        client_prepare_state: "sent",
        timezone_offset_min: -420,
        timezone: "Asia/Jakarta",
        conversation_mode: { kind: "primary_assistant" },
        enable_message_followups: true,
        system_hints: [],
        supports_buffering: true,
        supported_encodings: ["v1"],
        client_contextual_info: {
            is_dark_mode: false,
            time_since_loaded: 15,
            page_height: 1070,
            page_width: 553,
            pixel_ratio: 1.306249976158142,
            screen_height: 1225,
            screen_width: 552,
            app_name: "chatgpt.com"
        },
        no_auth_ad_preferences: {
            personalization_enabled: true,
            history_enabled: true,
            bazaar_consent_set: false
        },
        paragen_cot_summary_display_override: "allow",
        force_parallel_switch: "auto"
    };

    const res = await axios.post(
        BASE_CONVERSATION_URL,
        payload,
        {
            responseType: "stream",
            timeout: 60000,
            headers: {
                "authority": "chatgpt.com",
                "accept": "text/event-stream",
                "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                "content-type": "application/json",
                "origin": "https://chatgpt.com",
                "referer": "https://chatgpt.com/",
                "sec-ch-ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": '"Android"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "user-agent": UA,
                "oai-client-build-number": "6911970",
                "oai-client-version": "prod-741180aa2b79430e4f3840306c9dd2056745bbfc",
                "oai-device-id": uuid(),
                "oai-language": "id-ID",
                "oai-session-id": uuid(),
                "x-openai-target-path": "/backend-api/f/conversation",
                "x-openai-target-route": "/backend-api/f/conversation",
                "x-oai-turn-trace-id": uuid()
            }
        }
    );

    let rawBody = "";
    res.data.setEncoding("utf8");

    return await new Promise((resolve, reject) => {
        res.data.on("data", chunk => {
            rawBody += chunk;
        });

        res.data.on("end", () => {
            const parsed = parseSSE(rawBody);
            resolve({
                success: true,
                conversation_id: parsed.conversationId,
                message_id: parsed.assistantMessageId,
                model: "auto",
                answer: parsed.text
            });
        });

        res.data.on("error", reject);
    });
}

router.get("/", async (req, res) => {
    try {
        const prompt = req.query.prompt?.trim();

        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "ArulzXD",
                message: "Parameter prompt wajib diisi",
                example: "/api/ai/chatgpt?prompt=halo"
            });
        }

        const result = await askChatGPT(prompt);

        res.json({
            status: true,
            creator: "ArulzXD",
            result
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            message: err.message
        });
    }
});

router.status = "ready";
router.type = "free";

module.exports = router;