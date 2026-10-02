import re

with open("src/app/admin/page.tsx", "r") as f:
    admin = f.read()

admin = admin.replace(".order('created_at', { ascending: false })", ".order('started_at', { ascending: false })")

with open("src/app/admin/page.tsx", "w") as f:
    f.write(admin)

with open("src/app/dashboard/page.tsx", "r") as f:
    dashboard = f.read()

dashboard = dashboard.replace(".order('created_at', { ascending: false })", ".order('started_at', { ascending: false })")

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(dashboard)
