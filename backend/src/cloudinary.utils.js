// Obtener el public_id de una URL de Cloudinary
function obtenerPublicIdDesdeUrl(urlImagen) {
    if (!urlImagen) return null;

    try {
        const url = new URL(urlImagen);
        const partes = url.pathname.split('/upload/');

        if (partes.length !== 2) return null;

        const segmentos = partes[1].split('/').filter(Boolean);

        const indiceVersion = segmentos.findIndex(
            segmento => /^v\d+$/.test(segmento)
        );

        const rutaPublicId = indiceVersion >= 0
            ? segmentos.slice(indiceVersion + 1)
            : segmentos;

        if (rutaPublicId.length === 0) return null;

        const ultimoIndice = rutaPublicId.length - 1;

        rutaPublicId[ultimoIndice] = rutaPublicId[ultimoIndice]
            .replace(/\.[^.]+$/, '');

        return rutaPublicId.map(decodeURIComponent).join('/');
    } catch (error) {
        return null;
    }
}

module.exports = {
    obtenerPublicIdDesdeUrl
};