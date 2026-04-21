# Add 'Shared with Me' Functionality

This plan details the implementation of a "Shared with me" feature for v2, mirroring the capabilities described from the v1 project. Currently, sharing a material only sends an email with a link. This plan will add database persistence, allowing users to browse materials shared with them and authors to manage access.

## User Review Required

> [!IMPORTANT]
> Since v2 doesn't have a dedicated global `Materials` page like v1, I propose adding a new **"Shared with me"** tab in the Dashboard's sidebar (where your "Pinned Materials" currently are). This keeps all quick-access materials in one place. Please let me know if you prefer a different location.

## Proposed Changes

### Database Layer
#### [MODIFY] [schema.ts](file:///c:/Users/mariy/Projects/20260327%20Capstone/drizzle/schema.ts)
- Add a new `sharedMaterials` table to act as a bridge between `users` (recipients) and `materials`.
  - `id` (serial primary key)
  - `materialId` (foreign key to `materials`)
  - `sharedWithUserId` (foreign key to `users`)
  - `sharedByUserId` (foreign key to `users`)
  - `createdAt` (timestamp)
- Execute Drizzle migration generation to create the SQL migration file.

### Backend API
#### [NEW] [route.ts](file:///c:/Users/mariy/Projects/20260327%20Capstone/apps/web/app/api/materials/shared/route.ts)
- Create `GET /api/materials/shared` endpoint to fetch all materials shared with the current authenticated user. The response will include material details and the name/email of the user who shared it.

#### [MODIFY] [route.ts](file:///c:/Users/mariy/Projects/20260327%20Capstone/apps/web/app/api/materials/[id]/share/route.ts)
- Update `POST /api/materials/:id/share` to insert a record into the new `sharedMaterials` table *before* dispatching the email notification.
- Check for existing shares to prevent duplicate records.

#### [NEW] [route.ts](file:///c:/Users/mariy/Projects/20260327%20Capstone/apps/web/app/api/materials/[id]/share/[recipientId]/route.ts)
- Create `DELETE /api/materials/:id/share/:recipientId` to allow the material owner to revoke access (unshare).

### Frontend Dashboard UI
#### [MODIFY] [pinned-sidebar.tsx](file:///c:/Users/mariy/Projects/20260327%20Capstone/apps/web/components/dashboard/pinned-sidebar.tsx)
- Refactor to support two tabs: **Pinned** and **Shared with me**.
- Add the UI for displaying read-only shared cards (title, type, shared date, "Shared by [name]").
- Clicking a shared card navigates the user to the material page.

#### [MODIFY] [dashboard-client-page.tsx](file:///c:/Users/mariy/Projects/20260327%20Capstone/apps/web/components/dashboard/dashboard-client-page.tsx)
- Fetch the shared-with-me data from the API and pass it to the sidebar component.

### Frontend Share Modal UI
#### [MODIFY] [share-modal.tsx](file:///c:/Users/mariy/Projects/20260327%20Capstone/apps/web/components/materials/share-modal.tsx)
- Extend the modal to fetch and display a list of users this material is currently shared with.
- Add an "Unshare" button next to each recipient to revoke access and delete the row from `sharedMaterials`.

## Open Questions

- Should users be able to interact with AI tools on materials shared with them, or should it be strictly read-only standard viewing?
- Do you agree with placing the "Shared with me" list in the Dashboard's right sidebar as a tab next to "Pinned Materials"?

## Verification Plan

### Automated Tests
- Run TypeScript compiler (`typecheck` or `tsc --noEmit`) to verify strict mode compliance across all new API routes and components.
- Validate the generated SQL migration file format.

### Manual Verification
- Share a material with another user.
- Log in as the recipient and verify that the note appears under "Shared with me" in the Dashboard sidebar.
- Click the shared note to verify access is granted and content renders correctly.
- As the owner, open the share modal again, view the list of recipients, and revoke access for the test user. Verify the recipient can no longer see the note in their Dashboard.
