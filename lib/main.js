exports.activate = function () {};

exports.consumeHyperlinkInjection = (hyperlink) => {
  return hyperlink.addInjectionPoint("source.dart", {
    types: ["comment"],
  });
};

exports.consumeTodoInjection = (todo) => {
  return todo.addInjectionPoint("source.dart", {
    types: ["comment"],
  });
};
