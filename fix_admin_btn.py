with open('src/app/admin/page.tsx', 'r') as f:
    content = f.read()

# Fix the button mess if there is one
content = content.replace('''            <span>Tənzimləmələr</span>
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition ${activeTab === "team" ? "bg-gray-100 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Users size={20} />
            <span>Komandamız</span>
          </button>
          </button>''', '''            <span>Tənzimləmələr</span>
          </button>
          
          <button
            onClick={() => setActiveTab("team")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition ${activeTab === "team" ? "bg-gray-100 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Users size={20} />
            <span>Komandamız</span>
          </button>''')

with open('src/app/admin/page.tsx', 'w') as f:
    f.write(content)
