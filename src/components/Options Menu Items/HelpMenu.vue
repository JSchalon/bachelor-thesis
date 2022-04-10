<template>
  <ul class="option-nested menu-option" tabIndex="0" role="button">
    <li class="option-dropdown-top">
      <p>Help</p>
    </li>
    <div class="option-box">
      <li class="option-item" @click="startIntroduction('intro/editor-intro')">
        <div class="menu-option-container">
          <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Editor Introduction</p>
        </div>
      </li>
      <li class="option-item" @click="startIntroduction('laban/laban-basic')">
        <div class="menu-option-container">
          <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Labanotation Introduction</p>
        </div>
      </li>
      <li class="option-item">
        <div class="menu-option-container has-sub-menu">
          <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Sign Introductions</p>
          <img src="@/assets/images/interaction-menu/triangle-left.svg" class="option-img dropdown">
          <ul class="option-nested sub-menu" tabIndex="0" role="button">
            <div class="option-box sub-menu">
              <li class="option-item" @click="startIntroduction('laban/direction-signs')">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/direction-signs.svg" class="option-img">
                  <p>Direction Signs</p>
                </div>
              </li>
              <li class="option-item" @click="startIntroduction('laban/turn-signs')">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/turn-signs.svg" class="option-img">
                  <p>Turn Signs</p>
                </div>
              </li>
              <li class="option-item" @click="startIntroduction('laban/relationship-bows')">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/relationship-bows.svg" class="option-img">
                  <p>Relationship Bows</p>
                </div>
              </li>
              <li class="option-item" @click="startIntroduction('laban/space-measurements')">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/space-measurement-signs.svg" class="option-img">
                  <p>Space Measurement Signs</p>
                </div>
              </li>
              <li class="option-item" @click="startIntroduction('laban/path-signs')">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/path-signs.svg" class="option-img">
                  <p>Path Signs</p>
                </div>
              </li>
              <li class="option-item" @click="startIntroduction('laban/body-parts')">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/body-part-signs.svg" class="option-img">
                  <p>Body Part Signs</p>
                </div>
              </li>
              <li class="option-item" @click="startIntroduction('laban/relationship-pins')">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/relationship-pins.svg" class="option-img">
                  <p>Relationship Pins</p>
                </div>
              </li>
              <li class="option-item" @click="startIntroduction('laban/misc-signs')">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/misc-signs.svg" class="option-img">
                  <p>Misc. Signs</p>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </li>
      <li class="option-item spacer"/>
      <li class="option-item">
        <a href="https://www.itm.uni-luebeck.de/service/imprint.html" target="blank">
          <div class="menu-option-container">
            <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
            <p>Imprint</p>
          </div>
        </a>
      </li>
      <li class="option-item">
        <a href="https://www.itm.uni-luebeck.de/service/datenschutzerkaerung.html" target="blank">
          <div class="menu-option-container">
            <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
            <p>Privacy Policy</p>
          </div>
        </a>
      </li>
    </div>
  </ul>
</template>

<script>
/**
 * The standard Help menu component
 * @displayName Options Help Menu
 */
export default {
    name: 'HelpMenu',
    emits: ["requestNewScore", "startIntroduction"],
    props: {
      showShortCuts: Boolean
    },
    methods: {
      startIntroduction(which) {
        this.$emit("startIntroduction", which);
      },
    }
}
</script>


<style scoped>
a {
  margin: 0;
  padding: 0;
}
</style>