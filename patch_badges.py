import re

# 1. Dashboard Exam Results Badges
with open("src/app/dashboard/page.tsx", "r") as f:
    dashboard = f.read()

dashboard = dashboard.replace("select('*, exams(title)')", "select('*, exams(title, password)')")

old_title_dash = """                    <td className="p-4 font-medium text-gray-800">{att.exams?.title}</td>"""
new_title_dash = """                    <td className="p-4 font-medium text-gray-800">
                      {att.exams?.title}
                      {att.exams?.password ? (
                        <span className="ml-2 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Ödənişli</span>
                      ) : (
                        <span className="ml-2 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Ödənişsiz</span>
                      )}
                    </td>"""
dashboard = dashboard.replace(old_title_dash, new_title_dash)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(dashboard)

# 2. Admin Exam Results Badges
with open("src/app/admin/page.tsx", "r") as f:
    admin = f.read()

admin = admin.replace("select('*, exams(title)')", "select('*, exams(title, password)')")

old_title_admin = """                    <td className="p-4 font-medium text-gray-800">{att.exams?.title}</td>"""
new_title_admin = """                    <td className="p-4 font-medium text-gray-800">
                      <div className="flex flex-col items-start gap-1">
                        <span>{att.exams?.title}</span>
                        {att.exams?.password ? (
                          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Ödənişli</span>
                        ) : (
                          <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Ödənişsiz</span>
                        )}
                      </div>
                    </td>"""
admin = admin.replace(old_title_admin, new_title_admin)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(admin)

