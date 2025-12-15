Vue Workflow Builder

A visual workflow automation editor built with Vue 3, Vue Flow, and Pinia. This application allows users to design conversation flows—including triggers, messages, and business logic—using an interactive node-based canvas.
🛠️ Tech Stack

    Core: Vue 3 (Composition API), Vite, Pinia

    Visuals: @vue-flow/core, Tailwind CSS, Shadcn-vue, Lucide Icons

    Data: TanStack Vue Query, Zod (Validation), Native Intl API

⚡ Setup & Run

Prerequisites: Node.js (v18+)
code Bash

    
# 1. Clone the repository
git clone <repository-url>
cd respond-io-assessment

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build


💡 Design Decisions
1. "Dirty State" Editing Pattern

To ensure data integrity, the editing interface (SideDrawer.vue) works on a local copy of the node data.

    Mechanism: Changes are stored in local refs (editableTitle, etc.) and only committed to the global Pinia store when the user explicitly clicks Save.

    Safety: The app prevents closing the drawer if there are unsaved changes, triggering a confirmation dialog.

2. Logic Enforcement via Graph Structure

The Business Hours node dictates flow control, requiring exactly two outcomes.

    Constraint: Users cannot manually create "Connector" nodes.

    Automation: When a Business Hours node is created, the store automatically generates two downstream nodes ("Success" and "Failure"). This guarantees valid logic paths.

3. Recursive Deletion

Deleting a node within a graph can leave "orphan" nodes. The deleteNodeAndChildren action in the store performs a recursive traversal to remove the target node and all downstream dependencies in one operation.
4. Payload Polymorphism

The backend uses a generic payload array. The UI (SendMessage.vue) splits this into distinct UI elements (Text Inputs vs. File Uploads) for better UX, then merges them back into the strict JSON schema required by the API upon saving.
