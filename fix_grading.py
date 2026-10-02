import re

# FIX ADMIN PAGE
with open("src/app/admin/page.tsx", "r") as f:
    admin = f.read()

old_admin_graded = """                    {ans.graded ? (
                      <div className="text-green-700 font-bold bg-green-50 p-3 rounded-lg border border-green-100">
                        Qiymətləndirilib: {ans.points_awarded} Bal verildi.
                      </div>
                    ) : ("""
new_admin_graded = """                    {ans.graded ? (
                      ans.points_awarded === 0 ? (
                        <div className="text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                          <X size={16}/> Səhv cavab (0 Bal)
                        </div>
                      ) : (
                        <div className="text-green-700 font-bold bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-2">
                          <CheckCircle size={16}/> Doğru ({ans.points_awarded} Bal verildi)
                        </div>
                      )
                    ) : ("""
admin = admin.replace(old_admin_graded, new_admin_graded)
with open("src/app/admin/page.tsx", "w") as f:
    f.write(admin)

# FIX DASHBOARD PAGE
with open("src/app/dashboard/page.tsx", "r") as f:
    dash = f.read()

old_dash_graded = """                          {ans.graded ? (
                            <div className="text-green-700 font-bold bg-green-50 p-3 rounded-lg border border-green-100">
                              Qiymətləndirilib: {ans.points_awarded} Bal verildi.
                            </div>
                          ) : ("""
new_dash_graded = """                          {ans.graded ? (
                            ans.points_awarded === 0 ? (
                              <div className="text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                                <X size={16}/> Səhv cavab (0 Bal)
                              </div>
                            ) : (
                              <div className="text-green-700 font-bold bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-2">
                                <CheckCircle size={16}/> Doğru ({ans.points_awarded} Bal verildi)
                              </div>
                            )
                          ) : ("""
dash = dash.replace(old_dash_graded, new_dash_graded)
with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(dash)

