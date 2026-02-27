# H1B Wage Level - Edge Functions Deployment Script
# Run this script to deploy all edge functions to Supabase

Write-Host "🚀 Deploying H1B Wage Level Edge Functions..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to Supabase (if needed)
Write-Host "Step 1: Checking Supabase login..." -ForegroundColor Yellow
supabase projects list
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Please login to Supabase first:" -ForegroundColor Red
    Write-Host "   Run: supabase login" -ForegroundColor White
    exit 1
}

Write-Host "✅ Logged in to Supabase" -ForegroundColor Green
Write-Host ""

# Step 2: Link project
Write-Host "Step 2: Linking to project nngkmekxgljtnouazdql..." -ForegroundColor Yellow
supabase link --project-ref nngkmekxgljtnouazdql
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Failed to link project" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project linked" -ForegroundColor Green
Write-Host ""

# Step 3: Set secrets
Write-Host "Step 3: Setting environment secrets..." -ForegroundColor Yellow

Write-Host "  - Setting PAYPAL_CLIENT_ID..." -ForegroundColor Gray
supabase secrets set PAYPAL_CLIENT_ID="AcYuhmCAUCY5XhrzPskgsOrYeLxES5qD7n-kBcEhBY6xosFgg79Qijsut0C891NEV8Dso2diLaucZ5ZD"

Write-Host "  - Setting PAYPAL_CLIENT_SECRET..." -ForegroundColor Gray
supabase secrets set PAYPAL_CLIENT_SECRET="EAiFPObWbJqFFRKjYwl0WCb6kfIZLu9XxsTHMjqGyT2X1izr7hiA67fQrlVU7u4iugE17-vJTEcWRPDA"

Write-Host "  - Setting PAYPAL_MODE..." -ForegroundColor Gray  
supabase secrets set PAYPAL_MODE="sandbox"

Write-Host "  - Setting DB_URL..." -ForegroundColor Gray
supabase secrets set DB_URL="https://nngkmekxgljtnouazdql.supabase.co"

Write-Host "  - Setting DB_ANON_KEY..." -ForegroundColor Gray
supabase secrets set DB_ANON_KEY="your-anon-key-here"

Write-Host "  - Setting DB_SERVICE_ROLE_KEY..." -ForegroundColor Gray
supabase secrets set DB_SERVICE_ROLE_KEY="your-service-role-key-here"

Write-Host "  - Setting RESEND_API_KEY (optional for now)..." -ForegroundColor Gray  
supabase secrets set RESEND_API_KEY="placeholder"

Write-Host "  - Setting MS Graph Secrets..." -ForegroundColor Gray
supabase secrets set AZURE_TENANT_ID="your-tenant-id"
supabase secrets set AZURE_CLIENT_ID="your-client-id"
supabase secrets set AZURE_CLIENT_SECRET="your-client-secret"
supabase secrets set SENDER_EMAIL_ADDRESS="Support@teluguwalajobs.com"

Write-Host "  - Setting FROM_EMAIL..." -ForegroundColor Gray
supabase secrets set FROM_EMAIL="noreply@h1bwagelevellinks.com"

Write-Host "  - Setting APP_URL..." -ForegroundColor Gray
supabase secrets set APP_URL="your-app-url"

Write-Host "✅ Secrets set (except SERVICE_ROLE_KEY - set this manually)" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy functions
Write-Host "Step 4: Deploying edge functions..." -ForegroundColor Yellow

Write-Host "  - Deploying create-paypal-order..." -ForegroundColor Gray
supabase functions deploy create-paypal-order

Write-Host "  - Deploying capture-paypal-order..." -ForegroundColor Gray
supabase functions deploy capture-paypal-order

Write-Host "  - Deploying send-email..." -ForegroundColor Gray
supabase functions deploy send-email

Write-Host "  - Deploying renew-subscription..." -ForegroundColor Gray
supabase functions deploy renew-subscription

Write-Host ""
Write-Host "✅ All functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set the SERVICE_ROLE_KEY secret (see above)" -ForegroundColor White
Write-Host "2. Run the database migration (002_create_tables_no_rls.sql)" -ForegroundColor White
Write-Host "3. Restart your dev server: npm run dev" -ForegroundColor White
Write-Host "4. Test the payment flow!" -ForegroundColor White
Write-Host ""
