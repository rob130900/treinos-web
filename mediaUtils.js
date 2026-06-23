export const MAX_VIDEO_MB = 15;

// Lê um arquivo de vídeo como data URL (base64), com limite de tamanho.
export function videoFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Nenhum vídeo selecionado.'));
    if (!/^video\//.test(file.type)) return reject(new Error('Selecione um arquivo de vídeo.'));
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      return reject(new Error(`Vídeo muito grande (máx ${MAX_VIDEO_MB}MB). Grave um clipe mais curto.`));
    }
    const r = new FileReader();
    r.onload = (e) => resolve(e.target.result);
    r.onerror = () => reject(new Error('Erro ao ler o vídeo.'));
    r.readAsDataURL(file);
  });
}
