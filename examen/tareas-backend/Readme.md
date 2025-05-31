# ============================================
# GENERAR requirements.txt desde tu entorno actual
# ============================================

# 1. Generar requirements.txt con las versiones exactas instaladas
pip freeze > requirements.txt

# 2. Ver qué tienes instalado actualmente
pip list

# ============================================
# INSTALAR desde requirements.txt
# ============================================

# 3. Instalar todas las dependencias desde requirements.txt
pip install -r requirements.txt

# 4. Actualizar pip antes de instalar (recomendado)
python -m pip install --upgrade pip
pip install -r requirements.txt

# ============================================
# COMANDOS ÚTILES ADICIONALES
# ============================================

# 5. Instalar solo las dependencias de producción (sin las de desarrollo)
pip install -r requirements.txt --no-deps

# 6. Verificar que no hay conflictos entre dependencias
pip check

# 7. Desinstalar una dependencia específica
pip uninstall nombre-del-paquete

# 8. Actualizar una dependencia específica
pip install --upgrade nombre-del-paquete

# ============================================
# PARA DESARROLLO CON DIFERENTES ARCHIVOS
# ============================================

# Crear requirements-dev.txt para dependencias de desarrollo
# pip freeze > requirements-dev.txt

# Instalar dependencias de desarrollo
# pip install -r requirements-dev.txt

# ============================================
# EJEMPLO DE FLUJO COMPLETO
# ============================================

# 1. Crear entorno virtual
python -m venv venv

# 2. Activar entorno virtual
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# 3. Actualizar pip
python -m pip install --upgrade pip

# 4. Instalar desde requirements.txt
pip install -r requirements.txt

# 5. Verificar instalación
pip list