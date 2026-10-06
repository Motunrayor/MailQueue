const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const string = { type: "string" };
const email = { type: "string", format: "email", example: "alex@example.com" };
const objectId = { type: "string", pattern: "^[0-9a-fA-F]{24}$", example: "507f1f77bcf86cd799439011" };
const statuses = ["draft", "queued", "processing", "completed", "failed"];
const object = (properties, required = []) => ({ type: "object", properties, ...(required.length ? { required } : {}) });
const array = (items) => ({ type: "array", items });
const json = (schema) => ({ "application/json": { schema } });
const response = (description, schema) => ({ description, content: json(schema) });
const body = (schema) => ({ required: true, content: json(schema) });
const message = object({ success: { type: "boolean" }, message: string });
const success = (key, schema, paginated = false) => object({
  success: { type: "boolean" },
  ...(key ? { [key]: schema } : {}),
  ...(paginated ? { pagination: ref("Pagination") } : {}),
});
const profile = object({ user: ref("User") });
const auth = object({ success: { type: "boolean" }, token: string, user: ref("User") });
const pagination = (limit) => [
  { in: "query", name: "page", schema: { type: "integer", minimum: 1, default: 1 } },
  { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100, default: limit } },
  { in: "query", name: "search", schema: string },
];
const statusFilter = { in: "query", name: "status", schema: { type: "string", enum: statuses } };
const id = [{ in: "path", name: "id", required: true, schema: objectId }];
const error = (description) => response(description, message);
const operation = (tag, summary, schema, options = {}) => {
  const { public: isPublic, code = 200, errors = [], ...details } = options;
  return {
    tags: [tag], summary,
    ...(isPublic ? { security: [] } : {}),
    ...details,
    responses: {
      [code]: response("Successful response", schema),
      ...(!isPublic ? { 401: error("Missing, invalid, or expired Bearer token") } : {}),
      ...Object.fromEntries(errors.map(([status, description]) => [status, error(description)])),
      500: error("Server or database error"),
    },
  };
};
const contactInput = object({ full_name: { type: "string", example: "Alex Smith" }, email }, ["full_name", "email"]);
const campaignFields = {
  name: { type: "string", example: "Monthly newsletter" },
  subject: { type: "string", example: "This month's updates" },
  message: { type: "string", example: "Hello! Here are our latest updates." },
  recipients: { ...array(objectId), minItems: 1, description: "Contact IDs belonging to the authenticated user." },
};
const userFields = {
  firstname: { type: "string", example: "Alex" }, middlename: string,
  lastname: { type: "string", example: "Smith" }, email,
  phone_no: { type: "string", example: "+2348000000000" },
  address: { type: "string", example: "12 Example Street" },
  state: { type: "string", example: "Lagos" }, country: { type: "string", example: "Nigeria" },
  account_type: { type: "string", enum: ["individual", "organization"] },
  company_name: string, brand: string,
  socialmedia_url: object({ facebook: string, instagram: string, twitter: string, linkedin: string }),
};
const timestamps = { createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } };
const invalid = [400, "Invalid or missing input"];
const missingContact = [404, "Contact not found for the authenticated user"];
const missingCampaign = [404, "Campaign not found for the authenticated user"];
const duplicateContact = [409, "A contact with this email already exists"];
const adminOptions = { errors: [[403, "An admin account is required"]], description: "Requires an authenticated user with the admin role." };

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "MailQueue API", version: "1.0.0",
    description: "Authentication, contacts, email campaigns, and administration. Log in via /api/auth/login, copy the returned token, and paste it into Authorize. Campaign sending queues background jobs; the email worker processes delivery separately.",
  },
  servers: [{ url: "/", description: "Current API server" }],
  tags: ["Health", "Auth", "User", "Contacts", "Campaigns", "Admin"].map((name) => ({ name })),
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      User: object({ _id: objectId, ...userFields, role: { type: "string", enum: ["user", "admin"] }, accountStatus: { type: "string", enum: ["active", "suspended", "blocked"] }, onboardingstatus: { type: "string", enum: ["in_progress", "completed"] }, ...timestamps }),
      RegisterInput: {
        ...object({ ...userFields, password: { type: "string", format: "password", example: "ExamplePassword123!" } }, ["firstname", "lastname", "email", "password", "phone_no", "address", "state", "country", "account_type"]),
        description: "Organization accounts also require company_name and socialmedia_url.",
      },
      ProfileInput: {
        ...object({ ...userFields, socialMedia_url: object({ facebook: string, instagram: string, twitter: string, linkedin: string }) }, ["email", "address", "phone_no", "state", "country"]),
        description: "The current profile controller requires company_name and socialMedia_url (capital M) for organization accounts, while the model stores socialmedia_url (lowercase m).",
      },
      Contact: object({ _id: objectId, user: objectId, full_name: string, email, ...timestamps }),
      Campaign: object({
        _id: objectId, user: { oneOf: [objectId, ref("User")] }, ...campaignFields,
        recipients: array({ oneOf: [objectId, ref("Contact")] }),
        status: { type: "string", enum: statuses },
        totalRecipients: { type: "integer" }, processedCount: { type: "integer" }, successCount: { type: "integer" }, failedCount: { type: "integer" }, ...timestamps,
      }),
      Notification: object({
        _id: objectId, campaign: objectId, contact: ref("Contact"), email,
        status: { type: "string", enum: ["pending", "processing", "completed", "failed"] },
        error: { type: "string", nullable: true }, sentAt: { type: "string", format: "date-time", nullable: true }, ...timestamps,
      }),
      Pagination: object({ total: { type: "integer" }, page: { type: "integer" }, limit: { type: "integer" }, totalPages: { type: "integer" } }),
      AdminStats: object({
        totalUsers: { type: "integer" }, totalCampaigns: { type: "integer" }, totalJobs: { type: "integer" },
        campaigns: object(Object.fromEntries(statuses.map((status) => [status, { type: "integer" }]))),
        jobs: object(Object.fromEntries(["pending", "processing", "completed", "failed"].map((status) => [status, { type: "integer" }]))),
      }),
    },
  },
  paths: {
    "/api/health": { get: operation("Health", "Check API health", message, { public: true }) },
    "/api/auth/register": { post: operation("Auth", "Register an account", auth, { public: true, code: 201, requestBody: body(ref("RegisterInput")), errors: [invalid] }) },
    "/api/auth/login": { post: operation("Auth", "Log in and obtain a JWT", auth, {
      public: true, requestBody: body(object({ email, password: { type: "string", format: "password" } }, ["email", "password"])), errors: [[401, "Invalid email or password"]],
    }) },
    "/api/auth/me": { get: operation("Auth", "Get the authenticated account", success("user", ref("User")), { errors: [[404, "User not found"]] }) },
    "/api/auth/verify-email": { post: {
      tags: ["Auth"], summary: "Check whether an email is already registered", security: [],
      description: "This route currently only runs duplicate-email middleware. Existing emails return 400; unused emails fall through to the 404 handler. It does not send a verification email.",
      requestBody: body(object({ email }, ["email"])),
      responses: { 400: error("Email already exists"), 404: error("Unused email falls through to the not-found handler"), 500: error("Server or database error") },
    } },
    "/api/auth/forget-password": { post: operation("Auth", "Request a password reset code by email", message, {
      public: true, requestBody: body(object({ email }, ["email"])), errors: [invalid],
      description: "Always returns the same success message for valid email input, whether an account exists or not. Reset codes expire after 10 minutes.",
    }) },
    "/api/auth/change-password": { patch: operation("Auth", "Reset a password using the emailed code", message, {
      public: true, errors: [[400, "Missing input, invalid or expired code, too many attempts, or passwords do not match"]],
      requestBody: body(object({ email, otp_code: { type: "string", pattern: "^[0-9]{6}$", example: "123456" }, newPassword: { type: "string", format: "password", minLength: 8 }, confirmPassword: { type: "string", format: "password" } }, ["email", "otp_code", "newPassword", "confirmPassword"])),
    }) },
    "/api/user/me": {
      get: operation("User", "Get your profile", profile, { errors: [[404, "User not found"]] }),
      patch: operation("User", "Update your profile", profile, { requestBody: body(ref("ProfileInput")), errors: [invalid, [404, "User not found"]] }),
    },
    "/api/contacts": {
      get: operation("Contacts", "List your contacts", success("contacts", array(ref("Contact")), true), { parameters: pagination(100) }),
      post: operation("Contacts", "Create a contact", success("contact", ref("Contact")), { code: 201, requestBody: body(contactInput), errors: [invalid, duplicateContact] }),
    },
    "/api/contacts/{id}": {
      parameters: id,
      get: operation("Contacts", "Get a contact", success("contact", ref("Contact")), { errors: [invalid, missingContact] }),
      patch: operation("Contacts", "Update a contact", success("contact", ref("Contact")), {
        requestBody: body({ ...object(contactInput.properties), minProperties: 1, additionalProperties: false }), errors: [invalid, missingContact, duplicateContact],
      }),
      delete: operation("Contacts", "Delete a contact", message, { errors: [invalid, missingContact] }),
    },
    "/api/campaigns": {
      get: operation("Campaigns", "List your campaigns", success("data", array(ref("Campaign")), true), { parameters: [...pagination(10), statusFilter], errors: [invalid] }),
      post: operation("Campaigns", "Create a draft campaign", success("data", ref("Campaign")), { code: 201, requestBody: body(object(campaignFields, Object.keys(campaignFields))), errors: [invalid] }),
    },
    "/api/campaigns/{id}": {
      parameters: id,
      get: operation("Campaigns", "Get a campaign with recipient details", success("data", ref("Campaign")), { errors: [missingCampaign] }),
      patch: operation("Campaigns", "Update a draft campaign", success("data", ref("Campaign")), {
        description: "Only draft campaigns can be updated.",
        requestBody: body({ ...object(campaignFields), minProperties: 1, additionalProperties: false }), errors: [invalid, missingCampaign],
      }),
      delete: operation("Campaigns", "Delete a draft campaign", message, { errors: [[400, "Only draft campaigns can be deleted"], missingCampaign] }),
    },
    "/api/campaigns/{id}/send": {
      parameters: id,
      post: operation("Campaigns", "Queue a draft campaign for delivery", success("data", object({ campaignId: objectId, status: { type: "string", enum: ["queued"] }, queuedJobs: { type: "integer" } })), {
        description: "Creates one background job and notification per recipient. Only draft campaigns with valid contacts can be queued. Run the email worker to process delivery.",
        errors: [invalid, missingCampaign],
      }),
    },
    "/api/campaigns/{id}/notifications": {
      parameters: id,
      get: operation("Campaigns", "Get campaign delivery notifications", success("data", array(ref("Notification"))), { errors: [missingCampaign] }),
    },
    "/api/admin/users": { get: operation("Admin", "List registered users", success("data", array(ref("User")), true), {
      ...adminOptions, parameters: [...pagination(10), { in: "query", name: "role", schema: { type: "string", enum: ["user", "admin"] } }],
    }) },
    "/api/admin/campaigns": { get: operation("Admin", "List campaigns across all users", success("data", array(ref("Campaign")), true), {
      ...adminOptions, parameters: [...pagination(10), statusFilter], errors: [...adminOptions.errors, invalid],
    }) },
    "/api/admin/stats": { get: operation("Admin", "Get application and queue statistics", success("data", ref("AdminStats")), adminOptions) },
  },
};
