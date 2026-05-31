<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/booking">
    <html>
      <head>
        <title>SkillSwap Booking Summary</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
          section { max-width: 720px; border: 1px solid #dbe4ee; border-radius: 8px; padding: 24px; }
          h1 { margin-top: 0; color: #16a34a; }
          dl { display: grid; grid-template-columns: 160px 1fr; gap: 12px; }
          dt { font-weight: 700; color: #475569; }
          dd { margin: 0; }
          code { word-break: break-all; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <section>
          <h1>SkillSwap Booking Summary</h1>
          <dl>
            <dt>Booking ID</dt><dd><xsl:value-of select="id"/></dd>
            <dt>Student</dt><dd><xsl:value-of select="student"/></dd>
            <dt>Tutor</dt><dd><xsl:value-of select="tutor"/></dd>
            <dt>Skill</dt><dd><xsl:value-of select="skill"/></dd>
            <dt>Details</dt><dd><xsl:value-of select="details"/></dd>
            <dt>Status</dt><dd><xsl:value-of select="status"/></dd>
            <dt>Created</dt><dd><xsl:value-of select="createdAt"/></dd>
            <dt>Encrypted Details</dt><dd><code><xsl:value-of select="encryptedDetails"/></code></dd>
          </dl>
        </section>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
