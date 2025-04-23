import sanitize from 'sanitize-html';

export const sanitizeTaskDescription = (description: string) => {
  return sanitize(description, {
    allowedTags: ['h2', 'p', 'span'],
    allowedAttributes: {
      h2: ['class', 'level'],
      p: ['class'],
      span: ['class', 'data-type', 'data-id', 'data-label'],
    },
  });
};
