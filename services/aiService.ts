import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true, // Required for React Native
});

export interface AITaskPlan {
  title: string;
  overview: string;
  tasks: {
    task: string;
    priority: "High" | "Medium" | "Low";
    estimatedTime: string;
    scheduledFor: string; // YYYY-MM-DD
    notes?: string;
  }[];
  conflicts?: string[]; // List of potential scheduling conflicts
}

export interface ExistingTask {
  title: string;
  scheduledFor: string;
  estimatedTime: string;
  priority: string;
}

export const aiService = {
  async analyzeAndPlan(
    userInput: string,
    existingTasks: ExistingTask[] = [],
  ): Promise<AITaskPlan> {
    try {
      const existingTasksInfo =
        existingTasks.length > 0
          ? `\n\nEXISTING TASKS (avoid conflicts):\n${existingTasks.map((t) => `- ${t.scheduledFor}: "${t.title}" (${t.estimatedTime}, Priority: ${t.priority})`).join("\n")}`
          : "";

      const prompt = `You are a productivity AI assistant. Analyze the following unstructured text and convert it into a structured task plan.

User Input:
${userInput}${existingTasksInfo}

IMPORTANT: Return ONLY valid JSON in this exact format (no markdown, no code blocks, no additional text):
{
  "title": "Plan title",
  "overview": "Short explanation of what needs to be done",
  "tasks": [
    {
      "task": "Task name/description",
      "priority": "High | Medium | Low",
      "estimatedTime": "e.g. 45 mins, 2 hours, 1 day",
      "scheduledFor": "YYYY-MM-DD",
      "notes": "Any additional context or notes"
    }
  ],
  "conflicts": ["List any scheduling conflicts with existing tasks here"]
}

Rules:
1. Break down the input into realistic, actionable tasks
2. Assign appropriate priority (High/Medium/Low)
3. Estimate realistic time for each task
4. Suggest a reasonable schedule starting from today (${new Date().toISOString().split("T")[0]})
5. AVOID scheduling conflicts with existing tasks - choose different times/dates
6. If conflicts are unavoidable, list them in the "conflicts" array
7. Tasks should be specific and achievable
8. Return ONLY the JSON object, nothing else`;

      const completion = await openrouter.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("No response from AI");
      }

      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = responseContent.trim();
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/```json?\n?/g, "")
          .replace(/```\n?$/g, "");
      }

      const parsed = JSON.parse(cleanedResponse) as AITaskPlan;

      // Validate the structure
      if (!parsed.title || !parsed.overview || !Array.isArray(parsed.tasks)) {
        throw new Error("Invalid AI response structure");
      }

      return parsed;
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new Error("AI returned invalid JSON. Please try again.");
      }
      throw new Error(error.message || "Failed to analyze input");
    }
  },
};
