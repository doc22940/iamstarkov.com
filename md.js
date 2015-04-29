var compose = require('ramda').compose;
var moment = require('moment');

function md2AST(content) {
  var commonmark = require('commonmark');
  var reader = new commonmark.Parser();
  return reader.parse(content);
}

function getAstNode(content, match) {
  var walker = md2AST(content).walker();
  var event, node;
  while (event = walker.next()) {
    node = event.node;
    if (match(event)) {
      return node;
    }
  }
}

function isH1Node(event) {
  return event.entering && event.node.type === 'Header' && event.node.level === 1;
}

function isDate(event) {
  return event.entering && event.node.literal && moment(new Date(event.node.literal)).isValid();
}

function getDateNode(content) {
  return getAstNode(content, isDate);
}

function getTitleNode(content) {
  return getAstNode(content, isH1Node);
}

function astNode2text(astNode) {
  var walker = astNode.walker();
  var acc = '';
  var event, node;
  while (event = walker.next()) {
    node = event.node;
    if (node.literal) {
      acc += node.literal;
    }
  }
  return acc;
}

function markdown(content) {
  var commonmark = require('commonmark');
  var writer = new commonmark.HtmlRenderer();
  return writer.render(md2AST(content));
}

function text2unix(text) {
  return moment(new Date(text)).unix();
}

module.exports = {
  markdown: markdown,
  astNode2text: astNode2text,
  getTitleNode: getTitleNode,
  getTitle: compose(astNode2text, getTitleNode),
  getPublishedAt: compose(astNode2text, getDateNode),
  getPublishedAtInUnix: compose(text2unix, astNode2text, getDateNode)
};
