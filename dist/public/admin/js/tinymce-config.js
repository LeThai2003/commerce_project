tinymce.init({
    selector: 'textarea[textareaTiny]',
    plugins: 'lists link image table code help wordcount',
    entity_encoding: "raw",
    images_upload_url: '/admin/upload'
  });