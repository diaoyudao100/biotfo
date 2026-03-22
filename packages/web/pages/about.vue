<template>
  <div>
    <!-- Hero -->
    <section class="relative h-[50vh] min-h-[350px] bg-gray-900 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-primary-900/70 to-primary-800/50" />
      <div class="absolute inset-0 flex items-center justify-center text-center">
        <div class="max-w-2xl px-4">
          <h1 class="text-4xl sm:text-5xl font-bold text-white mb-4">品牌故事</h1>
          <p class="text-lg text-gray-200">源自热爱，成于品质</p>
        </div>
      </div>
    </section>

    <!-- Story -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="prose prose-lg max-w-none">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">我们的起源</h2>
        <p class="text-gray-600 leading-relaxed mb-6">
          {{ siteStore.brandName }} 诞生于 2020 年的一个夏天。创始人在多年的消费品行业经验中，深刻感受到消费者对高品质商品的渴望
          与市场供给之间的差距。太多时候，消费者需要在品质与价格之间做出妥协——我们相信，这不应该是唯一的选择。
        </p>
        <p class="text-gray-600 leading-relaxed mb-6">
          带着"让好物触手可及"的初心，我们踏上了品牌之路。从第一款产品的设计打样，到供应链的层层把控，
          每一步都倾注了团队的心血与执着。我们走访了上百家工厂，只为找到那些同样对品质有极致追求的合作伙伴。
        </p>
      </div>
    </section>

    <!-- Brand Values -->
    <section class="bg-white py-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900 text-center mb-12">品牌理念</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <div class="w-16 h-16 mx-auto mb-4 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">品质至上</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              我们对每一款产品都有着近乎苛刻的品质要求。从原材料甄选到成品检验，每一个环节都经过严格把控，
              确保交到消费者手中的，都是经得起考验的好产品。
            </p>
          </div>
          <div class="text-center p-6">
            <div class="w-16 h-16 mx-auto mb-4 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">用心服务</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              我们相信，购物体验的好坏不仅在于产品本身，更在于每一次与客户的互动。从售前咨询到售后保障，
              我们的团队始终以客户满意为第一目标。
            </p>
          </div>
          <div class="text-center p-6">
            <div class="w-16 h-16 mx-auto mb-4 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">可持续发展</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              我们关注每一个决策对环境的影响。从包装材料的选择到物流方式的优化，
              我们都在努力减少碳足迹，为地球的可持续发展贡献一份力量。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-2xl font-bold text-gray-900 text-center mb-12">发展历程</h2>
      <div class="relative">
        <!-- Line -->
        <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

        <div class="space-y-12">
          <div v-for="(event, idx) in timeline" :key="idx" class="relative flex items-start gap-8">
            <div class="absolute left-4 md:left-1/2 w-3 h-3 bg-primary-600 rounded-full -translate-x-1/2 mt-1.5 ring-4 ring-white" />
            <div :class="idx % 2 === 0 ? 'md:w-1/2 md:pr-12 md:text-right' : 'md:w-1/2 md:ml-auto md:pl-12'" class="pl-10 md:pl-0">
              <span class="text-sm font-semibold text-primary-600">{{ event.year }}</span>
              <h3 class="font-semibold text-gray-900 mt-1">{{ event.title }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ event.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-primary-600 py-16">
      <div class="max-w-2xl mx-auto text-center px-4">
        <h2 class="text-2xl font-bold text-white mb-4">加入我们的品质生活之旅</h2>
        <p class="text-primary-100 mb-8">每一次选择，都是对美好生活的投票</p>
        <NuxtLink
          to="/products"
          class="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
        >
          立即选购
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const siteStore = useSiteStore()

const timeline = [
  {
    year: '2020',
    title: '品牌创立',
    description: `怀揣对品质生活的追求，${siteStore.brandName} 正式成立。`,
  },
  {
    year: '2021',
    title: '首款产品上线',
    description: '经过数月打磨，第一批精选好物正式与消费者见面，获得热烈反响。',
  },
  {
    year: '2022',
    title: '品类拓展',
    description: '产品线扩展至居家、服饰、数码等多个品类，服务超过 10 万用户。',
  },
  {
    year: '2023',
    title: '品质升级',
    description: '引入全链路品控体系，与国际一线供应商建立深度合作。',
  },
  {
    year: '2024',
    title: '持续成长',
    description: '不忘初心，继续为更多消费者带来高品质、高性价比的好产品。',
  },
]
</script>
