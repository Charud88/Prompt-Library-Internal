export type Category =
    | "Engineering"
    | "QA / Testing"
    | "Product"
    | "Design / UX"
    | "Marketing"
    | "Sales"
    | "Customer Support"
    | "HR / Internal Ops"
    | "Leadership / Strategy";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Status = "draft" | "pending" | "approved" | "archived";

export interface Prompt {
    id: string;
    title: string;
    category: Category[];
    role: string;
    use_case: string;
    prompt_text: string;
    model_compatibility: string[];
    difficulty: Difficulty;
    status: Status;
    version: string;
    owner: string;
    created_at: string;
    updated_at: string;
}

export const MOCK_PROMPTS: Prompt[] = [
    {
        id: "1",
        title: "Unit Test Generator for Jest",
        category: ["Engineering", "QA / Testing"],
        role: "Senior Developer",
        use_case: "Quickly generate Jest unit tests for React components.",
        prompt_text: "Act as a senior React developer. Write Jest unit tests for the following component, covering all edge cases and using react-testing-library...",
        model_compatibility: ["GPT-4", "Claude 3.5 Sonnet"],
        difficulty: "Intermediate",
        status: "approved",
        version: "1.0.2",
        owner: "Sanya S.",
        created_at: "2024-02-15T10:00:00Z",
        updated_at: "2024-02-20T14:30:00Z",
    },
    {
        id: "2",
        title: "Product Requirement Doc (PRD) Template",
        category: ["Product"],
        role: "Product Manager",
        use_case: "Create a structured PRD from raw brainstorming notes.",
        prompt_text: "You are an expert PM. Transform the following notes into a formal PRD with User Stories, Success Metrics, and Technical Constraints...",
        model_compatibility: ["GPT-4o"],
        difficulty: "Advanced",
        status: "approved",
        version: "2.1.0",
        owner: "Rahul M.",
        created_at: "2024-01-10T09:00:00Z",
        updated_at: "2024-02-22T11:00:00Z",
    },
    {
        id: "3",
        title: "SQL Query Optimizer",
        category: ["Engineering"],
        role: "Data Engineer",
        use_case: "Optimize complex SQL queries for PostgreSQL.",
        prompt_text: "Analyze the following SQL query and suggest optimizations for performance and readability. Focus on index usage and join strategies...",
        model_compatibility: ["Claude 3 Opus", "GPT-4"],
        difficulty: "Advanced",
        status: "approved",
        version: "1.0.0",
        owner: "Amit K.",
        created_at: "2024-02-18T16:00:00Z",
        updated_at: "2024-02-18T16:00:00Z",
    },
    {
        id: "4",
        title: "Go Service Boilerplate Generator",
        category: ["Engineering"],
        role: "Backend Lead",
        use_case: "Scaffold a new microservice in Go following company standards.",
        prompt_text: "Generate a Go microservice boilerplate using Gin and GORM. Include folder structure for controllers, services, and repositories...",
        model_compatibility: ["GPT-4o"],
        difficulty: "Advanced",
        status: "pending",
        version: "0.9.0",
        owner: "Vikram P.",
        created_at: "2024-02-22T14:00:00Z",
        updated_at: "2024-02-22T14:00:00Z",
    },
    {
        id: "5",
        title: "Marketing Copy Tone Adjuster",
        category: ["Marketing"],
        role: "Content Strategist",
        use_case: "Adjust the tone of marketing copy to be more professional or witty.",
        prompt_text: "Rewrite the following marketing copy to sound more professional yet approachable. Avoid overused corporate jargon...",
        model_compatibility: ["GPT-4"],
        difficulty: "Beginner",
        status: "pending",
        version: "1.0.0",
        owner: "Ananya R.",
        created_at: "2024-02-23T08:00:00Z",
        updated_at: "2024-02-23T08:00:00Z",
    }
];

