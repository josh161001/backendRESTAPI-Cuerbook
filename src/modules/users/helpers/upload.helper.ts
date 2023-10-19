// Helper que modifica el nombre de la imagen que se sube al servidor
export const renameImage = (req, file, callback) => {
  const name = file.originalname.split('.')[0];

  const fileName = file.originalname;

  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  callback(null, `${name}-${randomName}${fileName}`);
};

// Helper que filtra los archivos que se suben al servidor
export const imagenFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new Error('Solo se permiten imagenes tipo jpg, png, jpeg, gif'),
      false,
    );
  }

  callback(null, true);
};
