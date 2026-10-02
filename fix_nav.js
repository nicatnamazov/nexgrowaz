const fs = require('fs');
let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

const navStart = content.indexOf('<nav className="space-y-2">');
const navEnd = content.indexOf('</nav>', navStart);

const newNav = `<nav className="space-y-2">
          <button
            onClick={() => setActiveTab("news")}
            className={\`w-full flex items-center space-x-2 px-4 py-2 rounded-md \${activeTab === "news" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}\`}
          >
            <FileText size={20} />
            <span>Xəbərlər</span>
          </button>
          
          <button
            onClick={() => setActiveTab("forms")}
            className={\`w-full flex items-center space-x-2 px-4 py-2 rounded-md \${activeTab === "forms" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}\`}
          >
            <Send size={20} />
            <span>Müraciətlər</span>
          </button>

          <button
            onClick={() => setActiveTab("universities")}
            className={\`w-full flex items-center space-x-2 px-4 py-2 rounded-md \${activeTab === "universities" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}\`}
          >
            <GraduationCap size={20} />
            <span>Universitetlər</span>
          </button>
          
          <button
            onClick={() => setActiveTab("settings")}
            className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition \${activeTab === "settings" ? "bg-gray-100 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}\`}
          >
            <Settings size={20} />
            <span>Tənzimləmələr</span>
          </button>
          
          <button
            onClick={() => setActiveTab("team")}
            className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition \${activeTab === "team" ? "bg-gray-100 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}\`}
          >
            <Users size={20} />
            <span>Komandamız</span>
          </button>
`;

content = content.substring(0, navStart) + newNav + content.substring(navEnd);
fs.writeFileSync('src/app/admin/page.tsx', content);
