(function(){dust.register("eventForm",body_0);function body_0(chk,ctx){return chk.write("<div class=\"event_id\">Element ").reference(ctx.get("id"),ctx,"h").write("</div><img src=\"img/delete.png\" class=\"event_delete\"/><div class=\"col1\">Element name:<br/>Start time:<br/>End time:<br/></div><div class=\"col2\"><input type=\"text\" class=\"elname\" value=").reference(ctx.get("name"),ctx,"h").write("><br/><input type=\"text\" class=\"starttime\" value=").reference(ctx.get("start"),ctx,"h").write("><br/><input type=\"text\" class=\"endtime\" value=").reference(ctx.get("end"),ctx,"h").write("><br/></div><div class=\"col3\">link: <input type=\"text\" class=\"link\" value=").reference(ctx.get("link"),ctx,"h").write("><br/><br/><div class=\"left\">hover?</div><div id=\"hover\" class=\"left\"></div></br><input type=\"text\" class=\"hover_text\" value=\"").reference(ctx.get("hoverText"),ctx,"h").write("\" readonly><br/><textarea type=\"text\" class=\"hover_css\" rows=\"5\" readonly>").reference(ctx.get("hoverCss"),ctx,"h").write("</textarea></div><div class=\"clear\"></div><div id=\"afx_file_button\" class=\"button green\">upload afx data</div><form enctype=\"multipart/form-data\"><input type=\"file\" name=\"afx_file\" id=\"afx_file\" accept=\".json\"/></form><div id=\"afx_file_text\"></div>");}return body_0;})();