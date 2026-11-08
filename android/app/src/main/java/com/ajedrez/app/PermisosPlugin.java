package com.ajedrez.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// "Acceso a todos los archivos": sin él, la app no ve los PGN que escribe Syncthing.
@CapacitorPlugin(name = "Permisos")
public class PermisosPlugin extends Plugin {
    @PluginMethod
    public void estado(PluginCall call) {
        JSObject r = new JSObject();
        r.put("concedido", Environment.isExternalStorageManager());
        call.resolve(r);
    }

    @PluginMethod
    public void pedir(PluginCall call) {
        Intent i = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, Uri.parse("package:" + getContext().getPackageName()));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }
}
