# Project-Onion-Setup
Scalable .NET Web API template implementing Onion/Clean Architecture. Pre-configured with Specification pattern, Pagination, and Middlewares to jumpstart your backend projects.

# 🧅 Clean Architecture .NET Boilerplate

![.NET](https://img.shields.io/badge/.NET-10.0-purple?style=flat-square&logo=dotnet)
![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20Onion-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

A robust, production-ready **.NET Boilerplate** built on the principles of **Clean Architecture** (Onion Architecture). This template is designed to jumpstart your next backend project by providing a highly scalable, maintainable, and decoupled foundation with essential design patterns and components pre-configured.

---

## 📺 Learn How It Was Built!
**Want to understand the core concepts behind this architecture?** I created a comprehensive video series explaining how I built this architecture step-by-step, covering the design patterns, layers, and best practices.
👉 **[Watch the full YouTube Playlist Here!](https://youtube.com/playlist?list=PLZt80_IWMtWfip3vpnDFWDYOw55b5zT2e&si=Siuzc6pCJ7BuEHSh)**

---

## ✨ Key Features & Implemented Patterns

This template comes fully loaded with industry-standard practices:

### 📐 Design Patterns
* **Generic Repository Pattern:** Abstracts data access logic and promotes code reuse.
* **Unit of Work Pattern:** Ensures data consistency and manages database transactions centrally.
* **Specification Pattern:** Encapsulates complex query logic (filtering, sorting, pagination) away from the Application layer, keeping services clean.

### 🛠️ Core Components
* **Global Exception Handling Middleware:** A centralized mechanism to catch and handle all application errors gracefully without try-catch hell.
* **Standardized API Response Wrapper:** Ensures all API endpoints return a unified JSON structure (`Success`, `Message`, `Data`, `Errors`), making frontend integration seamless.
* **AutoMapper Integration:** Pre-configured mapping profiles to translate Domain Entities into DTOs and vice versa.
* **Pagination Support:** Built-in classes and models to handle data pagination effortlessly.

---

## 🚀 How to Use This Template

Follow these steps to generate a brand-new project from this boilerplate:

### 1. Clone the Repository
Clone this repo into your local machine and remove the Git history to start fresh:
```bash
git clone [https://github.com/SobihMohamed/CleanArchitecture-Setup.git](https://github.com/SobihMohamed/CleanArchitecture-Setup.git) MyNewProject
cd MyNewProject
# Remove the existing .git folder
rm -rf .git  # (Or manually delete the hidden .git folder on Windows)
git init     # Initialize your own fresh repository
```

### 2. Rename Projects & Namespaces
To adapt the template to your specific project name (e.g., `SkillBridge`):
1. **In Visual Studio:** Rename the Solution and the individual Projects in the Solution Explorer.
2. **In Code:** Press `Ctrl + Shift + H` (Find and Replace in Files), search for the old namespace (e.g., `Project`), and replace it with your new project name across the `Entire Solution`.
3. **In Folders:** Close Visual Studio, go to your file explorer, and rename the actual physical project folders. Open the `.sln` file in a text editor to update the folder paths, then reopen the Solution.

### 3. Setup the Database (DbContext)
The data persistence logic is isolated in the `Infrastructure` layer. To start adding your own tables:
1. Create your entities in the `Domain` layer (inheriting from `BaseEntity`).
2. Navigate to `Infrastructure/Persistence/ApplicationDbContext.cs`.
3. Add your `DbSet` properties:
   ```csharp
   public DbSet<YourNewEntity> YourNewEntities { get; set; }
   ```

### 4. Database Configuration
Set up your connection string in the `appsettings.json` file located in the **Web** project:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=...;Database=...;Trusted_Connection=True;"
}
```

### 5. Running Migrations
Open the **Package Manager Console (PMC)**, set the **Default Project** to your `Persistence` layer project, and run the following commands:

```powershell
Add-Migration InitialCreate
Update-Database
```

### 6. Project Structure (The Layers)

* **Core (Domain & Abstractions):** The heart of the application. Contains Entities, Interfaces, and Custom Exceptions. It is strictly independent of any external frameworks or libraries.
* **Application / Services:** Contains the Business Logic, DTOs, Mapping Profiles (AutoMapper), and Service interface implementations.
* **Infrastructure (Persistence & Shared):** Handles external concerns. Contains EF Core Data Access, `ApplicationDbContext`, Repository implementations, and external services like Email or File Storage.
* **Web / API (Presentation):** The entry point of the application. Contains Controllers, `Program.cs` configurations, Middleware (Global Exception Handling), and Dependency Injection (DI) setup.

---
*Created by **Sobieh**. Feel free to fork, use, and contribute!*
