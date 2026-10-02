with open('src/app/admin/page.tsx', 'r') as f:
    content = f.read()

target = """          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition ${activeTab === "settings" ? "bg-gray-100 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Settings size={20} />
            <span>Tənzimləmələr</span>
          </button>"""

replacement = target + """
          <button
            onClick={() => setActiveTab("team")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition ${activeTab === "team" ? "bg-gray-100 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Users size={20} />
            <span>Komandamız</span>
          </button>"""

content = content.replace(target, replacement)

with open('src/app/admin/page.tsx', 'w') as f:
    f.write(content)
