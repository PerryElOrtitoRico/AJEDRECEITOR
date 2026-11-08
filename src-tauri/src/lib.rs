// Acceso a la carpeta de partidas (la que sincroniza Syncthing). Solo nombres simples, nunca rutas.
use std::{fs, path::PathBuf, time::UNIX_EPOCH};

#[derive(serde::Serialize)]
struct Archivo {
    nombre: String,
    modificado: u64,
}

fn carpeta_partidas() -> Result<PathBuf, String> {
    let home = std::env::var("HOME").map_err(|_| "falta HOME".to_string())?;
    let dir = PathBuf::from(home).join("Documentos/Carpeta personal/Ajedrez/Partidas");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

// El nombre llega de la interfaz: se rechaza todo lo que pueda salir de la carpeta.
fn ruta(nombre: &str) -> Result<PathBuf, String> {
    if nombre.is_empty() || nombre.starts_with('.') || nombre.contains('/') || nombre.contains('\\') {
        return Err(format!("nombre inválido: {nombre}"));
    }
    Ok(carpeta_partidas()?.join(nombre))
}

#[tauri::command]
fn carpeta() -> Result<String, String> {
    Ok(carpeta_partidas()?.to_string_lossy().into_owned())
}

#[tauri::command]
fn listar() -> Result<Vec<Archivo>, String> {
    let mut archivos = Vec::new();
    for entrada in fs::read_dir(carpeta_partidas()?).map_err(|e| e.to_string())? {
        let entrada = entrada.map_err(|e| e.to_string())?;
        let meta = entrada.metadata().map_err(|e| e.to_string())?;
        if !meta.is_file() {
            continue;
        }
        let modificado = meta
            .modified()
            .ok()
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map_or(0, |d| d.as_millis() as u64);
        archivos.push(Archivo { nombre: entrada.file_name().to_string_lossy().into_owned(), modificado });
    }
    Ok(archivos)
}

#[tauri::command]
fn leer(nombre: String) -> Result<String, String> {
    fs::read_to_string(ruta(&nombre)?).map_err(|e| e.to_string())
}

// Escritura atómica: <nombre>.tmp y renombrar (Syncthing nunca ve un archivo a medias).
#[tauri::command]
fn escribir(nombre: String, texto: String) -> Result<(), String> {
    let destino = ruta(&nombre)?;
    let temporal = ruta(&format!("{nombre}.tmp"))?;
    fs::write(&temporal, texto).map_err(|e| e.to_string())?;
    fs::rename(&temporal, &destino).map_err(|e| e.to_string())
}

#[tauri::command]
fn borrar(nombre: String) -> Result<(), String> {
    fs::remove_file(ruta(&nombre)?).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![carpeta, listar, leer, escribir, borrar])
        .run(tauri::generate_context!())
        .expect("no se pudo abrir la ventana de Tauri");
}
