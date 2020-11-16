package com.fcl.SSLIntercept;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;


import java.util.ArrayList;
import java.util.List;

@NativePlugin()
public class SSLIntercept extends Plugin {

    private static List<String> fingerprints = new ArrayList<String>();

    @PluginMethod()
    public void addFingerprint(PluginCall call) {
        String fingerprint = call.getString("fingerprint");
        this.fingerprints.add(fingerprint);
        call.success();
    }

    @PluginMethod()
    public void removeFingerprint(PluginCall call) {
        String fingerprint = call.getString("fingerprint");
        this.fingerprints.remove(fingerprint);
        call.success();
    }

    @PluginMethod()
    public void getFingerprints(PluginCall call) {
        JSArray list = new JSArray(this.fingerprints);
        JSObject result = new JSObject();
        result.put("fingerprints", list);
        call.resolve(result);
        call.success();
    }

    public boolean isAllowed(String fingerprint) {
        return this.fingerprints.contains(fingerprint);
    }

}
