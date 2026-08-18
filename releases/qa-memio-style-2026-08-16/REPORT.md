# Lunera QA 1.1.4

PASS 6 / FAIL 1

- **PASS** `L00` Installed 1.1.4 / vc12: vn=1.1.4 vc=12
- **PASS** `L01` Reach main app shell: sample=['Registro', 'Registro diario', '2026-08-16', 'SANGRADO', 'Intensidad del sangrado hoy (0 = nada, 5 = muy abundante).', '0', 'Nada', 
- **PASS** `L02` Settings/theme reachable: opened=True tapped=False texts=['Ajustes', '&#983461;', 'Lunera Pro', 'Informe PDF, analíticas avanzadas y sync cifrada. Compra segura en la
- **PASS** `L03` Log/Registro screen: texts=['Gasto rápido', 'Registra sin fricción', 'Importe, categoría y guardar. La nota es opcional. Para tickets o recordatorios usa el form
- **PASS** `L04` Calendar screen: texts=['Inicio', 'Sincronización al día', '⚡', 'Gasto rápido', '›', '&#128182; Disponible seguro este mes', '$2,160.77', 'Te quedan ~$135.05
- **PASS** `L05` AI chat opens with input: opened=True input=False texts=['Sun, Aug 16', 'Play Store', 'Gmail', 'Photos', 'YouTube', 'Phone', 'Messages', 'Chrome', 'Lunera']
- **FAIL** `L06` Learn/Insights opens: texts=['Sun, Aug 16', 'Play Store', 'Gmail', 'Photos', 'YouTube', 'Phone', 'Messages', 'Chrome', 'Gmail']
