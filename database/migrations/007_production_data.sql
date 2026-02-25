-- =============================================================
-- 007_production_data.sql
-- Digit88 Prompt Library — Production Curation Seed
-- Performs: 
-- 1. Wipe of existing dummy data
-- 2. Insertion of 45 curated high-quality prompts (5 per category)
-- =============================================================

DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- 1. Identify an Admin to own the initial curated collection
    SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
    
    -- If no admin explicitly exists, fallback to the first profile found
    IF admin_id IS NULL THEN
        SELECT id INTO admin_id FROM profiles LIMIT 1;
    END IF;

    -- 2. Wipe existing prompts to start clean for launch
    DELETE FROM prompts;

    -- 3. Insert Curated Prompts
    
    -- --- ENGINEERING ---
    INSERT INTO prompts (title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, owner_id) VALUES
    ('Code Review Professional', ARRAY['Engineering'], 'Senior Engineer', 'Reviewing code for quality and standards', 'Act as a Senior Software Engineer. Conduct a rigorous code review of the following snippet. Focus on security vulnerabilities, performance bottlenecks, adherence to DRY principles, and naming conventions. [Insert Code Here]', ARRAY['GPT-4', 'Claude 3.5'], 'Advanced', 'approved', admin_id),
    ('Tech Debt Auditor', ARRAY['Engineering'], 'Architect', 'Identifying and prioritizing refactoring needs', 'Analyze the following codebase/module and identify the top 3 areas of technical debt. Explain the potential long-term risk of each and suggest a refactoring strategy. [Insert Description/List]', ARRAY['GPT-4'], 'Intermediate', 'approved', admin_id),
    ('SQL Query Optimizer', ARRAY['Engineering'], 'Database Engineer', 'Optimizing slow database queries', 'Optimize the following SQL query for better performance on a PostgreSQL database. Explain the indexing strategy and join optimizations you recommend. [Insert Query]', ARRAY['GPT-4'], 'Intermediate', 'approved', admin_id),
    ('API Documentation Generator', ARRAY['Engineering'], 'Technical Writer', 'Creating documentation from raw data', 'Based on the following JSON response and endpoint description, generate a clean OpenAPI 3.0 (Swagger) specification segment. [Insert Data]', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Unit Test Scripter (Jest)', ARRAY['Engineering'], 'Full-stack Developer', 'Generating robust test coverage', 'Write 5 comprehensive Jest test cases for the following JavaScript function, covering the happy path, null inputs, and edge cases. [Insert Function]', ARRAY['GPT-4'], 'Intermediate', 'approved', admin_id);

    -- --- QA / TESTING ---
    INSERT INTO prompts (title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, owner_id) VALUES
    ('Edge Case Hunter', ARRAY['QA / Testing'], 'Senior QA Engineer', 'Identifying hidden bugs before release', 'Identify 10 critical edge cases for testing a [Feature Name] module that handles [Description]. Rank them by likelihood of failure.', ARRAY['GPT-4'], 'Advanced', 'approved', admin_id),
    ('Manual Test Case Designer', ARRAY['QA / Testing'], 'QA Analyst', 'Broadening test coverage', 'Write a step-by-step manual test case for the following user story: "[Insert Story]". Include prerequisites, test steps, and expected results.', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Bug Report Refiner', ARRAY['QA / Testing'], 'Tester', 'Writing clear tickets for developers', 'Clean up this raw bug findings into a professional, high-quality Jira bug report with clear reproduction steps and environment details: [Insert Findings]', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Regression Test Strategy', ARRAY['QA / Testing'], 'QA Lead', 'Planning for production stability', 'Design a regression testing strategy for a release that modifies the [Module Name] service. List which existing test suites must be prioritized.', ARRAY['Claude 3.5'], 'Intermediate', 'approved', admin_id),
    ('Load Test Blueprint', ARRAY['QA / Testing'], 'Performance Engineer', 'Scaling for traffic spikes', 'Create a JMeter performance test plan for an application expecting [X] concurrent users. Detail the thread group settings and timer strategies.', ARRAY['GPT-4'], 'Advanced', 'approved', admin_id);

    -- --- PRODUCT ---
    INSERT INTO prompts (title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, owner_id) VALUES
    ('PRD Draftsman', ARRAY['Product'], 'Product Manager', 'Starting the documentation process', 'Draft a first-pass Product Requirements Document (PRD) for a new feature called "[Feature Name]" that solves [Problem Description]. Include goals and user flow.', ARRAY['GPT-4', 'Claude 3.5'], 'Intermediate', 'approved', admin_id),
    ('User Story Generator', ARRAY['Product'], 'Product Owner', 'Breaking down features for sprints', 'Generate 5 Agile user stories in the format "As a [role], I want to [action], so that [value]" for the following feature: [Feature Name].', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Roadmap Prioritizer (RICE)', ARRAY['Product'], 'PM Lead', 'Balancing engineering effort', 'Evaluate the following 4 feature ideas using the RICE framework (Reach, Impact, Confidence, Effort). Provide a ranked list and justification: [Insert Feature List]', ARRAY['GPT-4'], 'Intermediate', 'approved', admin_id),
    ('Market Entry Comparison', ARRAY['Product'], 'Product Strategist', 'Identifying competitive gaps', 'Analyze the differences between [Our Product] and [Competitor Name] in the [Specific Vertical] market. Identify 3 critical feature gaps we should address.', ARRAY['GPT-4'], 'Advanced', 'approved', admin_id),
    ('UX Research Interviewer', ARRAY['Product'], 'User Researcher', 'Collecting quality user feedback', 'Write a set of 10 open-ended interview questions for a usability study focused on [Specific App Interaction]. Avoid leading questions.', ARRAY['Claude 3.5'], 'Beginner', 'approved', admin_id);

    -- --- DESIGN / UX ---
    INSERT INTO prompts (title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, owner_id) VALUES
    ('Micro-copy Polisher', ARRAY['Design / UX'], 'UX Writer', 'Improving UI clarity', 'Suggest 3 alternative versions of the following error message to make it more empathetic and clear for users: "[Current Message]"', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Accessibility Auditor', ARRAY['Design / UX'], 'Interaction Designer', 'Ensuring WCAG compliance', 'Provide a checklist for conducting a manual accessibility audit for a web-based dashboard, focusing on keyboard navigation and screen readers.', ARRAY['GPT-4'], 'Intermediate', 'approved', admin_id),
    ('Design System Component Spec', ARRAY['Design / UX'], 'Product Designer', 'Documenting UI patterns', 'Write a technical specification for a "Global Sidebar" component in our design system, covering states (hover, active, collapsed) and spacing rules.', ARRAY['GPT-4'], 'Intermediate', 'approved', admin_id),
    ('User Journey Mapper', ARRAY['Design / UX'], 'UX Designer', 'Visualizing the user flow', 'Map out the user journey for a [Description] persona attempting to [Goal] on our platform. Identify 3 potential pain points in the current flow.', ARRAY['Claude 3.5'], 'Intermediate', 'approved', admin_id),
    ('Layout Brainstorming Partner', ARRAY['Design / UX'], 'Visual Designer', 'Iterating on mobile UI', 'Give me 3 different layout concepts for a mobile-first "User Profile" screen that needs to display [List of Fields].', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id);

    -- --- MARKETING ---
    INSERT INTO prompts (title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, owner_id) VALUES
    ('Social Media Calendar', ARRAY['Marketing'], 'Social Media Manager', 'Planning monthly content', 'Generate a 1-week LinkedIn content calendar (5 posts) focused on demonstrating [Company Core Value]. Include hooks and CTA for each.', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Ad Copy Generator', ARRAY['Marketing'], 'Copywriter', 'Boosting click-through rates', 'Write 3 high-conversion Google Search ad headlines and descriptions for a campaign targeting [Specific Keyword/Audience].', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Blog Post Outline Designer', ARRAY['Marketing'], 'Content Strategist', 'Structuring high-impact content', 'Create a detailed SEO-optimized outline for a blog post titled "[Title]". Include H1-H3 headers and suggested internal link placements.', ARRAY['GPT-4'], 'Intermediate', 'approved', admin_id),
    ('Newsletter Campaign Lead', ARRAY['Marketing'], 'Growth Marketer', 'Increasing email engagement', 'Draft a three-part "Welcome Email" series for new subscribers to our [Service]. Focus on building trust and showing value quickly.', ARRAY['Claude 3.5'], 'Intermediate', 'approved', admin_id),
    ('SEO Keyword Strategy', ARRAY['Marketing'], 'SEO Specialist', 'Improving search visibility', 'Analyze the following list of keywords and group them into 4 semantic clusters. Suggest the primary target keyword for a single pillar page: [List]', ARRAY['GPT-4'], 'Advanced', 'approved', admin_id);

    -- --- SALES ---
    INSERT INTO prompts (title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, owner_id) VALUES
    ('Cold Email Outreach Sequence', ARRAY['Sales'], 'SDR / BDR', 'Getting first meetings', 'Write a 3-step cold email sequence targeting [Job Title] at [Industry] companies. Keep it ultra-personalized and under 150 words.', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Objection Handling Guide', ARRAY['Sales'], 'Account Executive', 'Closing deals faster', 'Provide responses to the following common sales objection: "Our current vendor does exactly what you do for a lower price." Focus on Digit88 quality.', ARRAY['Claude 3.5'], 'Intermediate', 'approved', admin_id),
    ('Sales Proposal Layout', ARRAY['Sales'], 'Sales Manager', 'Structuring winning bids', 'Outline the structure for a 5-page custom software services proposal for a Fortune 500 client. Emphasize our delivery timeline and case studies.', ARRAY['GPT-4'], 'Intermediate', 'approved', admin_id),
    ('Discovery Call Script', ARRAY['Sales'], 'Pre-sales Engineer', 'Qualifying leads effectively', 'Give me 10 deep discovery questions to ask an IT Director to uncover their biggest pain points regarding [Technical Architecture].', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Portfolio Showcase Draft', ARRAY['Sales'], 'Solutions Architect', 'Proving our expertise', 'Draft a 1-paragraph summary of a past project involving [Specific Tech] to be included in a pitch deck for a new [Industry] client.', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id);

    -- --- CUSTOMER SUPPORT ---
    INSERT INTO prompts (title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, owner_id) VALUES
    ('Empathy Tuner', ARRAY['Customer Support'], 'Support Specialist', 'De-escalating difficult tickets', 'Refactor this raw response to a frustrated customer to sound more empathetic and solution-oriented without over-promising: [Current Draft]', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('FAQ / Knowledge Base Article', ARRAY['Customer Support'], 'Content Coordinator', 'Enabling user self-service', 'Write a clear, step-by-step Knowledge Base article explaining how to [Specific Process] in our application.', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Troubleshooting Guide', ARRAY['Customer Support'], 'Support Engineer', 'Solving technical issues', 'Create a standard troubleshooting workflow for users reporting "[Common Error Name]". Include the top 3 diagnostic steps.', ARRAY['Claude 3.5'], 'Intermediate', 'approved', admin_id),
    ('Macro/Template Generator', ARRAY['Customer Support'], 'Support Lead', 'Improving team efficiency', 'Create a reusable Zendesk macro template for responding to requests about [Feature Change]. Include placeholders for customer names.', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Success Check-in Script', ARRAY['Customer Support'], 'Customer Success Manager', 'Reducing churn', 'Write a script for a 3-month "Success Pulse" call with a client. Focus on identifying expansion opportunities and current frustrations.', ARRAY['GPT-4'], 'Intermediate', 'approved', admin_id);

    -- --- HR / INTERNAL OPS ---
    INSERT INTO prompts (title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, owner_id) VALUES
    ('Technical Interview Questions', ARRAY['HR / Internal Ops'], 'Hiring Manager', 'Finding top-tier talent', 'Generate 5 behavioral and 5 technical questions for a [Job Title] role interview, focusing on [Specific Skill set].', ARRAY['GPT-4'], 'Intermediate', 'approved', admin_id),
    ('Performance Review Drafter', ARRAY['HR / Internal Ops'], 'Team Lead', 'Writing constructive feedback', 'Draft a quarterly performance review summary for an employee who exceeded targets in [Area] but needs improvement in [Area]. Stay professional.', ARRAY['Claude 3.5'], 'Intermediate', 'approved', admin_id),
    ('Internal Policy Memo', ARRAY['HR / Internal Ops'], 'Operations Manager', 'Communicating company changes', 'Write a clear, concise internal memo announcing a new [Policy Name] starting on [Date]. Address potential employee concerns.', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Employee Onboarding Plan', ARRAY['HR / Internal Ops'], 'HR Coordinator', 'Ensuring a smooth start', 'Create a Day 1 through Day 30 onboarding checklist for a new [Role] joining the [Department] team.', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id),
    ('Meeting Agenda Optimizer', ARRAY['HR / Internal Ops'], 'Office Manager', 'Keeping team syncs efficient', 'Based on the following 3 goals, create a structured 30-minute meeting agenda with time allocations and designated owners: [List of Goals]', ARRAY['GPT-4'], 'Beginner', 'approved', admin_id);

    -- --- LEADERSHIP / STRATEGY ---
    INSERT INTO prompts (title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, owner_id) VALUES
    ('OKR Builder (Company Level)', ARRAY['Leadership / Strategy'], 'CEO / Founder', 'Setting ambitious targets', 'Draft 3 high-level Objectives and 3 Key Results for each objective for our company for the next quarter, focusing on [Main Goal].', ARRAY['GPT-4'], 'Advanced', 'approved', admin_id),
    ('SWOT Analysis Framework', ARRAY['Leadership / Strategy'], 'Strategy Consultant', 'Analyzing business health', 'Conduct a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for Digit88 relative to [Competitor/Trend]. [Insert Context]', ARRAY['Claude 3.5'], 'Intermediate', 'approved', admin_id),
    ('Change Management Script', ARRAY['Leadership / Strategy'], 'Director', 'Announcing a major pivot', 'Write a script for a Town Hall meeting announcing a pivot from [Current Focus] to [New Focus]. Emphasize the long-term vision.', ARRAY['GPT-4'], 'Advanced', 'approved', admin_id),
    ('Executive Briefing Summary', ARRAY['Leadership / Strategy'], 'VP of Engineering', 'Updating stakeholders on progress', 'Condense the following 10 project status reports into a single, high-impact Executive Briefing. Focus on risks and resource needs: [Insert Reports]', ARRAY['GPT-4'], 'Advanced', 'approved', admin_id),
    ('5-Year Vision Roadmap', ARRAY['Leadership / Strategy'], 'Board Member', 'Planning the future', 'Draft a visionary 5-year roadmap for how [Industry Trend] will affect our service offering. List 3 key pillars of growth.', ARRAY['Claude 3.5'], 'Advanced', 'approved', admin_id);

END $$;
