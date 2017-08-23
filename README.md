# Railway distance plates/posts generator
JavaScript generating PDF documents with kilometre/hectometre posts/plates for railway model layouts. Making great use of [pdfkit by devongovett](https://github.com/devongovett/pdfkit).

Script supports following styles of railway distance indicators:
* Polish distance posts (since epoch IIIa);
* Polish distance plates from electrified rail lines (technical font, epoch III-IV);
* Polish distance plates from electrified rail lines (stencil font, epoch IV-V);
* Polish distance plates from electrified rail lines (according to specification Ie-102, late epoch V);
* German distance posts for main and secondary lines (epoch II);
* German distance plates for main and secondary lines (since epoch IV).

Own styles of plates/posts can be added by inheriting class `Model`.

Script is prepared for localization and is already translated into English, Polish and German. Own translation can be created by inheriting from class `Translation`.

Example usage, see `index.html` and [pkprepo.net](http://pkprepo.net/distance-plates-and-posts/).

