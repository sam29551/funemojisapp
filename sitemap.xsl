<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap - FunEmojis.app</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #334155;
            background-color: #f8fafc;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            padding: 32px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          h1 {
            color: #1e293b;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          p {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 24px;
            line-height: 1.6;
          }
          .stats {
            display: inline-block;
            background: #eef2ff;
            color: #4f46e5;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            text-align: left;
            padding: 12px 14px;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 12px 14px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
          }
          tr:hover {
            background-color: #f8fafc;
          }
          a {
            color: #4f46e5;
            text-decoration: none;
            font-weight: 500;
          }
          a:hover {
            text-decoration: underline;
          }
          .priority-badge {
            background: #ecfdf5;
            color: #059669;
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✨ FunEmojis.app XML Sitemap</h1>
          <p>
            This XML Sitemap is automatically generated for search engines like Google, Bing, and Yahoo to index all multilingual landing pages and resources of <strong>FunEmojis.app</strong>.
          </p>
          <div class="stats">
            Total URLs in this Sitemap: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
          </div>
          <table>
            <thead>
              <tr>
                <th width="60%">URL Location</th>
                <th width="15%">Priority</th>
                <th width="15%">Change Freq</th>
                <th width="10%">Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <xsl:variable name="itemURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <a href="{$itemURL}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <span class="priority-badge">
                      <xsl:value-of select="sitemap:priority"/>
                    </span>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
