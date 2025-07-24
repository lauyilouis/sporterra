# Sporterra API Endpoints

## User Section Data

### GET /api/users/:userId/sections/:sectionId

Returns user data for a specific section, including all datagrids, columns, and user-specific data rows.

#### Parameters

- `userId` (path parameter): The UUID of the user
- `sectionId` (path parameter): The UUID of the section
- `tenantId` (query parameter, optional): The UUID of the tenant for multi-tenant isolation

#### Example Request

```bash
curl -X GET "http://localhost:3001/api/users/bb136443-a67b-4a76-959d-eef468baf32c/sections/6e3196d4-6f19-418b-aaa3-85813484d72e?tenantId=ecf4a9da-bbea-432d-85a0-a5d5d7e4f0a7" \
  -H "Content-Type: application/json"
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "bb136443-a67b-4a76-959d-eef468baf32c",
      "firstName": "John",
      "lastName": "Doe",
      "email": "test@example.com",
      "profileImageUrl": null
    },
    "section": {
      "id": "6e3196d4-6f19-418b-aaa3-85813484d72e",
      "name": "Experience",
      "description": "Professional experience and achievements",
      "order": 1,
      "datagrids": [
        {
          "id": "aad4a8e8-8b1c-400f-96bb-facc129ca4ea",
          "name": "Experience",
          "description": "Professional experience entries",
          "order": 1,
          "columns": [
            {
              "key": "team",
              "label": "Team",
              "type": "text",
              "required": true,
              "order": 1,
              "validationRules": null,
              "config": null
            }
          ],
          "rows": [
            {
              "id": "2895cfc8-6c15-46d3-b066-2f3f08999547",
              "data": {
                "team": "Toronto Raptors"
              },
              "order": 1,
              "isActive": true,
              "createdAt": "2025-07-24T06:52:59.682Z",
              "updatedAt": "2025-07-24T06:52:59.682Z"
            }
          ]
        }
      ]
    }
  }
}
```

#### Error Responses

**400 Bad Request - Invalid UUID**
```json
{
  "error": "Invalid UUID format",
  "message": "Both userId and sectionId must be valid UUIDs"
}
```

**404 Not Found - User not found**
```json
{
  "error": "User not found",
  "message": "The specified user does not exist or you do not have access to them"
}
```

**404 Not Found - Section not found**
```json
{
  "error": "Section not found",
  "message": "The specified section does not exist or you do not have access to it"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "message": "An error occurred while fetching the user section data"
}
```

#### Features

- **Multi-tenant support**: Optional `tenantId` query parameter for data isolation
- **UUID validation**: Validates both userId and sectionId parameters
- **Comprehensive data**: Returns user info, section details, datagrids, columns, and user-specific data rows
- **Ordered results**: Datagrids, columns, and rows are returned in their specified order
- **Error handling**: Proper HTTP status codes and descriptive error messages 