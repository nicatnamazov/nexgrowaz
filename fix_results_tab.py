import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

# We need to add `const [expandedUser, setExpandedUser] = useState<string | null>(null);` to `ResultsTab`.
content = content.replace("const [grading, setGrading] = useState<Record<string, number>>({});", "const [grading, setGrading] = useState<Record<string, number>>({});\n  const [expandedUser, setExpandedUser] = useState<string | null>(null);")

# Now let's build the grouped UI block.
old_table_ui = """  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">İmtahan Nəticələri</h2>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Tələbə</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">İmtahan</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Tarix</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Bal</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Heç bir nəticə yoxdur.</td></tr>
              ) : (
                attempts.map(att => (
                  <tr key={att.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{att.profiles?.first_name} {att.profiles?.last_name}</div>
                      <div className="text-xs text-gray-500">{att.profiles?.phone || "Nömrə yoxdur"}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      <div className="flex flex-col items-start gap-1">
                        <span>{att.exams?.title}</span>
                        {att.exams?.password ? (
                          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Ödənişli</span>
                        ) : (
                          <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Ödənişsiz</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{new Date(att.started_at).toLocaleDateString('az-AZ')}</td>
                    <td className="p-4">
                      {att.status === 'pending' ? (
                        <span className="bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-md text-[11px] font-bold border border-yellow-100 flex items-center gap-1 w-fit"><Clock size={12}/> Yoxlanılmalıdır</span>
                      ) : (
                        <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-md text-[11px] font-bold border border-green-100 flex items-center gap-1 w-fit"><CheckCircle size={12}/> Yoxlanılıb</span>
                      )}
                    </td>
                    <td className="p-4 font-black text-lg">{att.score}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openAttempt(att)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-sm transition-colors flex items-center gap-1">
                          {att.status === 'pending' ? <Edit size={16}/> : <FileText size={16}/>}
                          {att.status === 'pending' ? 'Yoxla' : 'Bax'}
                        </button>
                        <button onClick={() => handleDelete(att.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );"""

new_table_ui = """  const groupedAttempts = attempts.reduce((acc, att) => {
    const uid = att.user_id;
    if (!acc[uid]) acc[uid] = { profile: att.profiles, attempts: [] };
    acc[uid].attempts.push(att);
    return acc;
  }, {} as Record<string, { profile: any, attempts: any[] }>);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">İmtahan Nəticələri</h2>
      </div>

      <div className="space-y-4">
        {Object.keys(groupedAttempts).length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border border-dashed rounded-2xl text-gray-500">
            Heç bir nəticə yoxdur.
          </div>
        ) : (
          Object.entries(groupedAttempts).map(([userId, data]) => (
            <div key={userId} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div 
                onClick={() => setExpandedUser(expandedUser === userId ? null : userId)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                    {data.profile?.first_name?.charAt(0) || "?"}{data.profile?.last_name?.charAt(0) || ""}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{data.profile?.first_name} {data.profile?.last_name}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <span>{data.profile?.phone || "Nömrə yoxdur"}</span>
                      <span>•</span>
                      <span className="font-medium">{data.attempts.length} imtahan nəticəsi</span>
                    </p>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg className={`w-6 h-6 transform transition-transform ${expandedUser === userId ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {expandedUser === userId && (
                <div className="border-t bg-gray-50/50 p-4">
                  <div className="grid gap-3">
                    {data.attempts.map(att => (
                      <div key={att.id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800">{att.exams?.title}</h4>
                            {att.exams?.password ? (
                              <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Ödənişli</span>
                            ) : (
                              <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Ödənişsiz</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{new Date(att.started_at).toLocaleString('az-AZ')}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Status</span>
                            {att.status === 'pending' ? (
                              <span className="text-yellow-600 text-xs font-bold flex items-center gap-1"><Clock size={12}/> Yoxlanılmalıdır</span>
                            ) : (
                              <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Yoxlanılıb</span>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end border-l pl-4">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Bal</span>
                            <span className="font-black text-lg">{att.score}</span>
                          </div>

                          <div className="flex gap-2 ml-2">
                            <button onClick={() => openAttempt(att)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-sm transition-colors flex items-center gap-1">
                              {att.status === 'pending' ? <Edit size={16}/> : <FileText size={16}/>}
                              {att.status === 'pending' ? 'Yoxla' : 'Bax'}
                            </button>
                            <button onClick={() => handleDelete(att.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );"""

content = content.replace(old_table_ui, new_table_ui)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)

