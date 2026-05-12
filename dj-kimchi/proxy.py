import http.server, urllib.request, urllib.error

class H(http.server.BaseHTTPRequestHandler):
    def d(self):
        t = "http://127.0.0.1:3001" + self.path
        b = None
        try:
            if self.headers.get("Content-Length"):
                b = self.rfile.read(int(self.headers["Content-Length"]))
            r = urllib.request.Request(t, data=b, method=self.command)
            for k, v in self.headers.items():
                if k.lower() not in ("host","connection","transfer-encoding","content-length"):
                    r.add_header(k, v)
            x = urllib.request.urlopen(r, timeout=10)
            self.send_response(x.status)
            for k, v in x.getheaders():
                if k.lower() not in ("transfer-encoding","connection"):
                    self.send_header(k, v)
            self.end_headers()
            self.wfile.write(x.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code); self.end_headers()
            try: self.wfile.write(e.read())
            except: pass
        except Exception as e:
            self.send_error(502, str(e))
    do_GET=do_POST=do_PUT=do_DELETE=do_PATCH=do_HEAD=do_OPTIONS=d
    def log_message(self,*a): pass

http.server.HTTPServer.allow_reuse_address=True
s=http.server.HTTPServer(("0.0.0.0",3000),H)
print("Ready",flush=True)
s.serve_forever()
