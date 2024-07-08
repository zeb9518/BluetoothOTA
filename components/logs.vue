<script setup>
import { ref, toRefs, watch, onMounted, defineProps, computed, nextTick } from 'vue'
import { getCurrentInstance } from 'vue'

const props = defineProps({
  logs: String,
})

const instance = getCurrentInstance()
const scrollTop = ref(0) //滚动条位置
const scrollHeight = ref(0) // 滚动视图的高度
const { logs } = toRefs(props)




onMounted(() => {
  initScrollHeight();
})

// 监听 logs 变化，并在变化时滚动到底部
watch(logs, () => {
  initContentHeight();

});


// 滚动到底部的函数
function initScrollHeight() {
  uni.createSelectorQuery().in(instance).select('.log-scroll-view').boundingClientRect(data => {
    if (data) {
      scrollHeight.value = data.height
    }
  }).exec();
}
// 获取内容高度
function initContentHeight() {
  uni.createSelectorQuery().in(instance).select('.scroll-content').boundingClientRect(data => {
    if (data) {
      const top = data.height - scrollHeight.value;
      if (top > 0) {
        scrollTop.value = top;
      }
    }
  }).exec();
}


</script>

<template>
  <scroll-view class="log-scroll-view bg-white" scroll-y :scroll-top="scrollTop" :scroll-with-animation="true">
    <view class="scroll-content">
      <text>{{ logs }} </text>
    </view>
  </scroll-view>
</template>

<style scoped>
.log-scroll-view {
  height: 650rpx;
}
</style>