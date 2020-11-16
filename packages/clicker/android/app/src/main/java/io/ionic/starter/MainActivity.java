package io.ionic.starter;

import android.net.http.SslCertificate;
import android.net.http.SslError;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.fcl.SSLIntercept.SSLIntercept;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginHandle;

import java.io.ByteArrayInputStream;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SignatureException;
import java.security.cert.Certificate;
import java.security.cert.CertificateEncodingException;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
  private WebView webView;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      add(SSLIntercept.class);
    }});
  }

  @Override
  protected void init(Bundle savedInstanceState, List<Class<? extends Plugin>> plugins) {
    super.init(savedInstanceState, plugins);
    webView = findViewById(com.getcapacitor.android.R.id.webview);

    PluginHandle h = bridge.getPlugin("SSLIntercept");
    SSLIntercept sslIntercept = (SSLIntercept) h.getInstance();

    BridgeWebViewClient client = new BridgeWebViewClient(this.bridge){
      @Override
      public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        Log.d("WVClient", "SSL ER");

        SslCertificate sslCertificate = error.getCertificate();
        Certificate cert = getX509Certificate(sslCertificate);


        MessageDigest md = null;
        String hexString = "";
        try {
          md = MessageDigest.getInstance("SHA256");
          X509Certificate c = sslCertificate.getX509Certificate();
          byte[] publicKey = md.digest(c.getEncoded());
          hexString = "sha256/" + Base64.encodeToString(publicKey, 0);
        } catch (NoSuchAlgorithmException | CertificateEncodingException e) {
          e.printStackTrace();
        }
        hexString = hexString.replace("\n", "");
        Log.d("WVClient", hexString);
        if(sslIntercept.isAllowed(hexString)) {
          handler.proceed();
        }
        super.onReceivedSslError(view, handler, error);
      }

      public String byte2HexFormatted(byte[] arr) {
        StringBuilder str = new StringBuilder(arr.length * 2);
        for (int i = 0; i < arr.length; i++) {
          String h = Integer.toHexString(arr[i]);
          int l = h.length();
          if (l == 1) h = "0" + h;
          if (l > 2) h = h.substring(l - 2, l);
          str.append(h.toUpperCase());
          if (i < (arr.length - 1)) str.append(':');
        }
        return str.toString();
      }


      // credits to @Heath Borders at http://stackoverflow.com/questions/20228800/how-do-i-validate-an-android-net-http-sslcertificate-with-an-x509trustmanager
      private Certificate getX509Certificate(SslCertificate sslCertificate){
        Bundle bundle = SslCertificate.saveState(sslCertificate);
        byte[] bytes = bundle.getByteArray("x509-certificate");
        if (bytes == null) {
          return null;
        } else {
          try {
            CertificateFactory certFactory = CertificateFactory.getInstance("X.509");
            return certFactory.generateCertificate(new ByteArrayInputStream(bytes));
          } catch (CertificateException e) {
            return null;
          }
        }
      }

    };
    webView.setWebViewClient(client);

  }
}
