using System;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Diagnostics;
using System.Threading;
using System.Reflection;
using System.Windows.Forms;

namespace Somiti360
{
    static class Program
    {
        private static HttpListener listener;
        private static string webRoot;
        private static volatile bool isRunning = true;

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string appDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Somiti360");
                webRoot = Path.Combine(appDataDir, "www");

                string localDist = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist");
                if (Directory.Exists(localDist) && File.Exists(Path.Combine(localDist, "index.html")))
                {
                    webRoot = localDist;
                }
                else
                {
                    string markerFile = Path.Combine(webRoot, ".version");
                    string exeTime = "";
                    try { exeTime = File.GetLastWriteTimeUtc(Assembly.GetExecutingAssembly().Location).Ticks.ToString(); } catch { }
                    bool needsExtract = !Directory.Exists(webRoot) || !File.Exists(Path.Combine(webRoot, "index.html")) || !File.Exists(markerFile) || (exeTime != "" && File.ReadAllText(markerFile).Trim() != exeTime);
                    if (needsExtract)
                    {
                        try { if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true); } catch { }
                        Directory.CreateDirectory(webRoot);
                        Assembly assembly = Assembly.GetExecutingAssembly();
                        using (Stream stream = assembly.GetManifestResourceStream("app.zip"))
                        {
                            if (stream != null)
                            {
                                string tempZip = Path.Combine(appDataDir, "temp_app.zip");
                                using (FileStream fileStream = File.Create(tempZip))
                                {
                                    stream.CopyTo(fileStream);
                                }
                                ZipFile.ExtractToDirectory(tempZip, webRoot);
                                try { File.Delete(tempZip); } catch { }
                                try { if (!string.IsNullOrEmpty(exeTime)) File.WriteAllText(markerFile, exeTime); } catch { }
                            }
                        }
                    }
                }

                int port = GetFreePort();
                string url = "http://127.0.0.1:" + port + "/";

                StartServer(url);

                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);

                Form form = new Form();
                form.Text = "সমিতি ৩৬০ (Somiti 360) - ডিজিটাল সমিতি ও সমবায় ব্যবস্থাপনা";
                form.Width = 1366;
                form.Height = 850;
                form.StartPosition = FormStartPosition.CenterScreen;
                form.WindowState = FormWindowState.Maximized;

                WebBrowser browser = new WebBrowser();
                browser.Dock = DockStyle.Fill;
                browser.IsWebBrowserContextMenuEnabled = false;
                browser.ScriptErrorsSuppressed = true;

                form.Controls.Add(browser);

                form.Shown += (s, e) =>
                {
                    try { Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }); }
                    catch { browser.Navigate(url); }
                };

                form.FormClosing += (s, e) =>
                {
                    isRunning = false;
                    try { if (listener != null) listener.Stop(); } catch { }
                };

                Application.Run(form);
            }
            catch (Exception ex)
            {
                MessageBox.Show("ত্রুটি: " + ex.Message, "সমিতি ৩৬০ ত্রুটি", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                isRunning = false;
                try { if (listener != null) listener.Stop(); } catch { }
            }
        }

        private static int GetFreePort()
        {
            TcpListener l = new TcpListener(IPAddress.Loopback, 0);
            l.Start();
            int port = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();
            return port;
        }

        private static void StartServer(string prefix)
        {
            listener = new HttpListener();
            listener.Prefixes.Add(prefix);
            listener.Start();

            ThreadPool.QueueUserWorkItem((o) =>
            {
                while (isRunning)
                {
                    try
                    {
                        HttpListenerContext context = listener.GetContext();
                        ThreadPool.QueueUserWorkItem((c) => ProcessRequest((HttpListenerContext)c), context);
                    }
                    catch
                    {
                        if (!isRunning) break;
                    }
                }
            });
        }

        private static void ProcessRequest(HttpListenerContext context)
        {
            try
            {
                string rawUrl = context.Request.Url.AbsolutePath;
                if (rawUrl == "/" || string.IsNullOrEmpty(rawUrl)) rawUrl = "/index.html";

                string relPath = rawUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                string filePath = Path.Combine(webRoot, relPath);

                if (!File.Exists(filePath))
                {
                    filePath = Path.Combine(webRoot, "index.html");
                }

                if (File.Exists(filePath))
                {
                    byte[] bytes = File.ReadAllBytes(filePath);
                    context.Response.ContentType = GetMimeType(filePath);
                    context.Response.ContentLength64 = bytes.Length;
                    context.Response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                    context.Response.OutputStream.Write(bytes, 0, bytes.Length);
                }
                else
                {
                    context.Response.StatusCode = 404;
                }
            }
            catch { }
            finally
            {
                try { context.Response.OutputStream.Close(); } catch { }
            }
        }

        private static string GetMimeType(string path)
        {
            string ext = Path.GetExtension(path).ToLower();
            switch (ext)
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js": return "application/javascript";
                case ".css": return "text/css";
                case ".json": return "application/json";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".svg": return "image/svg+xml";
                case ".ico": return "image/x-icon";
                default: return "application/octet-stream";
            }
        }
    }
}
