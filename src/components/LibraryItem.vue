<template>
  <div class="library-category-container" ref="container">
    <div class="library-category-name" @click="expand">
      <div class="center-vertically">
        <p class="context-item-text">{{langStrings.catName}}</p>
      </div>
      <div class="center-vertically context-item-interact-box">
          <img class="context-item-interact-img smaller" :class="active ? 'turned' : 'unturned'" src="@/assets/images/sign-categories/triangle-right.svg" alt="triangle" v-on:click="deletesign" />
      </div>
    </div>
    <div v-show="active" class="library-item-container">
      <div class="library-item" :key="index" v-for="(elem, index) of signs" @click="selectSign(index)">
        <svg width="100%" :height="height + 2" fill="white">
          <g :transform="'translate('+ getWidth() + ',1)'">
            <g :transform="elem.signData.baseType == 'RelationshipBow' ? 'translate(-60,0)' : ''">
              <component :is="elem.signData.baseType" :isSelected="index == selected" :height="elem.height" :signData="elem.signData"/>
            </g>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * The LibraryItem component
 * @displayName Library Item
 */
export default {
  name: 'LibraryItem',
  inject: ["barHeight"],
  emits: ["expand", "selectSign"],
  props: {
    active: Boolean,
    category: String,
    catIndex: Number,
    selected: Number,
  },
  data() {
    return {
      signs: [],
      height: 0, 
      baseHeight: 0,
    };
  },
  computed: {
    langStrings () {
      let lang = this.$store.state["language"];
      let json = require('@/assets/sign-category-loaders/' + this.category + '-' + lang + '.json');
      let obj = JSON.parse(JSON.stringify(json));
      return obj;
    }
  },
  mounted () {
    //load signs and add click functionality
    let json = require('@/assets/sign-category-loaders/' + this.category + '.json');
    let obj = JSON.parse(JSON.stringify(json));
    this.height = obj.catHeight;
    this.baseHeight = obj.baseHeight;
    let general = {};
    for (let [key,value] of Object.entries(obj.general[0])) {
        general[key] = value;
      }
    for (let index = 0; index < obj.signData.length; index++) {
      let newSign = {};
      newSign = Object.assign(newSign, general)
      newSign.signData = {};
      for (let [key,value] of Object.entries(obj.signData[index])) {
        newSign.signData[key] = value;
      }
      this.signs.push(newSign);
    }
  },
  methods: {
    expand () {
      this.$emit("expand", this.catIndex);
    },
    selectSign (index) {
      let nameElem = this.langStrings.names.find(elem => this.signs[index].signData.signType == elem.signType);
      this.$emit("selectSign", {catIndex: this.catIndex, name: nameElem.name, index: index, height: this.baseHeight, signData: this.signs[index].signData});
    },
    getWidth() {
      return this.$refs.container.offsetWidth / 6 - 20;
    }
  },
}
</script>


<style scoped>
  .turned {
    transform: rotate(90deg);
  }

  .unturned {
    transform: rotate(-90deg);
  }

  .selected {
    border: 1px solid blue;
  }
  
</style>
