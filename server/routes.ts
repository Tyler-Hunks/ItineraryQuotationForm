import type { Express } from "express";
import { createServer, type Server } from "http";
import { travelBookingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Travel booking form submission endpoint
  app.post("/api/travel-booking", async (req, res) => {
    try {
      // Validate request body
      const validatedData = travelBookingSchema.parse(req.body);
      
      // Log the received data for debugging
      console.log("Travel booking data received:", JSON.stringify(validatedData, null, 2));
      
      // Get webhook URL from environment variables
      const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.WEBHOOK_URL;
      
      if (webhookUrl) {
        try {
          // Forward to n8n webhook
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(validatedData)
          });
          
          if (!response.ok) {
            console.error(`Webhook failed with status: ${response.status}`);
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
          }
          
          const result = await response.json().catch(() => ({ success: true }));
          
          res.json({ 
            success: true, 
            message: "Travel booking submitted successfully to webhook",
            webhookResponse: result
          });
        } catch (webhookError) {
          console.error("Webhook submission error:", webhookError);
          // Still return success to user, but log the webhook failure
          res.json({ 
            success: true, 
            message: "Travel booking received successfully (webhook delivery failed)",
            data: validatedData,
            webhookError: webhookError instanceof Error ? webhookError.message : String(webhookError)
          });
        }
      } else {
        // No webhook URL configured, just accept the data
        res.json({ 
          success: true, 
          message: "Travel booking received successfully (no webhook configured)",
          data: validatedData
        });
      }
      
    } catch (error) {
      console.error("Error processing travel booking:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
