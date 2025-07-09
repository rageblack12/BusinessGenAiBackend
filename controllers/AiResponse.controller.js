import { InferenceClient } from "@huggingface/inference";
import { HTTP_STATUS } from '../constants/roles.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import dotenv from "dotenv";

dotenv.config();

// Initialize Hugging Face Inference Client
const client = new InferenceClient(process.env.HUGGING_FACE_API_KEY);

/**
 * Generates a human-like reply to a user comment based on sentiment and description
 * @route POST /api/ai/comment-reply
 * @access Private
 */
export const getCommentAIReply = asyncHandler(async (req, res, next) => {
  const { sentiment, description } = req.body;

  try {
    // Generate AI reply using Hugging Face Inference API
    const chatCompletion = await client.chatCompletion({
      provider: "nebius",
      model: "google/gemma-2-2b-it",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful customer support assistant. Based on the sentiment and description provided, write a short, professional, human-like reply. Do NOT use any placeholders like [Customer Name] or [Your Name]. Write the full message as-is, ready to send. Keep it polite, warm, and direct.",
        },
        {
          role: "user",
          content: `\nSentiment: ${sentiment}\nCustomer description: "${description}"\n\nWrite a ready-to-send reply without using placeholders. If negative, be apologetic and helpful. If positive, thank them. If neutral, acknowledge their description. Keep it under 100 words.\n          `.trim(),
        },
      ],
    });

    // Extract reply from AI response or use fallback message
    const reply =
      chatCompletion.choices?.[0]?.message?.content ||
      "Sorry, I'm unable to provide a response right now.";

    res.status(HTTP_STATUS.OK).json({ 
      success: true, 
      reply 
    });
  } catch (error) {
    console.error("AI comment reply error:", error);
    return next(new ErrorResponse('AI service failed', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
});

/**
 * Generates a professional reply to a user complaint based on severity and description
 * @route POST /api/ai/complaint-reply
 * @access Private
 */
export const getComplaintAIReply = asyncHandler(async (req, res, next) => {
  const { severity, description } = req.body;

  try {
    // Generate AI reply using Hugging Face Inference API
    const chatCompletion = await client.chatCompletion({
      provider: "nebius",
      model: "google/gemma-2-2b-it",
      messages: [
        {
          role: "system",
          content:
            "You are a professional customer complaint resolution assistant. Based on the severity and description, write a short and empathetic reply. Be helpful, calm, and acknowledge the seriousness based on severity level.",
        },
        {
          role: "user",
          content: `\nSeverity: ${severity}\nComplaint: "${description}"\n\nWrite a polite, human-sounding message ready to be sent. For "Urgent", be especially quick and serious. For "High", be helpful and promise fast resolution. For "Moderate", acknowledge and show intent to fix. Keep it under 100 words.\n          `.trim(),
        },
      ],
    });

    // Extract reply from AI response or use fallback message
    const reply =
      chatCompletion.choices?.[0]?.message?.content ||
      "Sorry, I'm unable to provide a response right now.";

    res.status(HTTP_STATUS.OK).json({ 
      success: true, 
      reply 
    });
  } catch (error) {
    console.error("AI complaint reply error:", error);
    return next(new ErrorResponse('Complaint AI service failed', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
});