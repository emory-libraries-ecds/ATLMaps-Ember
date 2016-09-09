import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
    classNames: ['draggable-item'],
    classNameBindings: ['taggedClass'],
    attributeBindings: ['draggable'],
    draggable: 'true',
    taggedClass: 'taggable',

    dragStart(event) {
        let tag = this.get('content');
        // this.setTaggedClass();
        return event.dataTransfer.setData('text/data', tag.get('id'), 'obj');
    },

    click() {
        // let { layer, tag } = this;
        // console.log('layer', layer);
        this.sendAction('action', this.tag.id);
        // this.set('taggedClass', 'tagged');
    }

    // didUpdateAttrs() {
    //     // let { tag } = this.tag;
    //     if (layer.get('tag_ids').indexOf(tag) !== -1) {
    //         this.set('taggedClass', 'tagged');
    //     } else {
    //         this.set('taggedClass', 'taggeable');
    //     }
    // }

});
