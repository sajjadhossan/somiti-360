using System;
using System.IO;
using System.IO.Compression;
using System.Windows.Forms;
using System.Drawing;

namespace Somiti360Desktop
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string appDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Somiti360");
            try
            {
                if (!Directory.Exists(appDir))
                {
                    Directory.CreateDirectory(appDir);
                }

                // Extract embedded app.zip resource
                var assembly = System.Reflection.Assembly.GetExecutingAssembly();
                using (var stream = assembly.GetManifestResourceStream("app.zip"))
                {
                    if (stream != null)
                    {
                        using (var archive = new ZipArchive(stream))
                        {
                            foreach (var entry in archive.Entries)
                            {
                                string destPath = Path.Combine(appDir, entry.FullName);
                                string dir = Path.GetDirectoryName(destPath);
                                if (!Directory.Exists(dir) && !string.IsNullOrEmpty(dir))
                                {
                                    Directory.CreateDirectory(dir);
                                }
                                if (!string.IsNullOrEmpty(entry.Name))
                                {
                                    entry.ExtractToFile(destPath, true);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Resource extract note: " + ex.Message);
            }

            string indexPath = Path.Combine(appDir, "index.html");
            Form form = new Form();
            form.Text = "সমিতি ৩৬০ (Somiti 360) — সমবায় ও সঞ্চয় ব্যবস্থাপনা পিসি অ্যাপ";
            form.Size = new Size(1280, 800);
            form.StartPosition = FormStartPosition.CenterScreen;

            WebBrowser browser = new WebBrowser();
            browser.Dock = DockStyle.Fill;
            browser.IsWebBrowserContextMenuEnabled = false;
            browser.ScriptErrorsSuppressed = true;

            if (File.Exists(indexPath))
            {
                browser.Navigate("file:///" + indexPath.Replace('\\', '/'));
            }
            else
            {
                browser.Navigate("https://somiti360.vercel.app");
            }

            form.Controls.Add(browser);
            Application.Run(form);
        }
    }
}
