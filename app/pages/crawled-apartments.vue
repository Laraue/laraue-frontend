<script setup lang="ts">
import { reactive, ref, watch} from "vue";
import LDateRangePicker from "../components/ui/LDateRangePicker.vue";
import {useRouter} from "vue-router";
import {
  faBed,
  faHome,
  faLayerGroup,
  faLocationDot,
  faMoneyBill,
  faRulerCombined,
  faSubway
} from '@fortawesome/free-solid-svg-icons'
import LNumberRangePicker from "../components/ui/LNumberRangePicker.vue";
import {type Advertisement, Filter, SourceType, useApartmentsApi} from "~/composables/apartmentsApi";

const filter = reactive<Filter>(new Filter())
const advertisements = ref<Advertisement[]>([])
const router = useRouter()
const route = useRoute()

const { loadApartments } = useApartmentsApi();

const lastLoadedOffset = ref<null | number>(null)
const lastPageLoaded = ref(false)

const defaultFilter = new Filter()

// Update query params based on filter
const updateQuery = async (filter: Filter) => {
  const queryParams = {}
  for (const key of Object.keys(defaultFilter)) {
    const value = filter[key as keyof Filter];
    if (value){
      if (value instanceof Date) {
      }
      else{
        (queryParams as any)[key] = value;
      }
    }
  }

  await router.push({ query: queryParams });
};

const resetAdvertisements = () => {
  advertisements.value = [];
  lastPageLoaded.value = false;
  lastLoadedOffset.value = null;
}

const loadAdvertisements = async () => {
  await updateQuery(filter);
  resetAdvertisements();
  await appendNextPagesBatch();
}

const appendNextPagesBatch = async () => {
  try {
    hasError.value = null;
    const perPage = 21;
    const nextOffset = lastLoadedOffset.value === null ? 0 : lastLoadedOffset.value + 1;
    console.log("Load offset", nextOffset);
    const nextBatchAdvertisements = await loadApartments(filter, nextOffset, perPage);
    advertisements.value.push(...nextBatchAdvertisements);
    lastLoadedOffset.value = nextOffset;
    if (nextBatchAdvertisements.length < perPage)
      lastPageLoaded.value = true;
    hasError.value = false;
  }
  catch (error) {
    hasError.value = true;
  }
};

let isLoading = false
const load = async () => {
  if (!lastPageLoaded.value && !isLoading)
    try {
      isLoading = true
      await appendNextPagesBatch();
    }
  finally {
    isLoading = false
  }
}

const colorRanges: {[key: string]: string} = {
  0.8: '#3D9209',
  0.7: '#709209',
  0.6: '#FFD43A',
  0.5: '#f5ac11',
  0: '#E42222'
}

const colorRangesSorted = Object.keys(colorRanges).map(parseFloat).sort((a, b) => b - a)

const getCoefficientColor = (coefficient: number): string => {
  const index = colorRangesSorted.find(v => v < coefficient)
  return colorRanges[index ?? 0]!
}

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const formatDate = (date: string) => {
  const result = new Date(Date.parse(date));
  return result.toLocaleDateString()
}

const hasError = ref<boolean | null>(false) // null - loading, false - no, true - yes
const filtersHidden = ref(false)

// First initialization
const query = route.query;
if (query.minPrice)
  filter.minPrice = Number.parseInt(query.minPrice as string);
if (query.maxPrice)
  filter.maxPrice = Number.parseInt(query.maxPrice as string);
if (query.minRenovationRating)
  filter.minRenovationRating = Number.parseInt(query.minRenovationRating as string);
if (query.maxRenovationRating)
  filter.maxRenovationRating = Number.parseInt(query.maxRenovationRating as string);

await loadAdvertisements();
watch(() => filter, async () => {
  await loadAdvertisements();
}, { deep: true });

const isPriceInMarket = (item: Advertisement) => item.totalPrice < item.predictedMarketPrice;
const getAddressString = (item: Advertisement) => {
  const parts = [item.cityName, item.address, item.houseNumber];
  return parts.filter(i => i && i.length > 0).join(', ');
}

useSeoMeta({
  title: 'AI-Ranked SPB Apartments',
  description: 'The Cian and Avito advertisements aggregator that automatically rank renovations',
})
</script>

<template>
  <el-button @click="filtersHidden=!filtersHidden" class="mobile-only expand-button">
    {{ filtersHidden ? '↓' : '↑' }}
  </el-button>
  <div class="container">
    <el-collapse>
      <el-aside class="filters" v-if="!filtersHidden">
        <label class="filter-label">City:</label>
        <el-select
            class="number-input"
            clearable
            v-model="filter.cityId">
          <el-option :value="3" label="Moscow" />
          <el-option :value="1" label="Saint-Petersburg" />
          <el-option :value="2" label="Volgograd" />
        </el-select>

        <label class="filter-label">Sort By:</label>
        <el-select
            class="number-input"
            id="sortBy"
            v-model="filter.sortBy">
          <el-option :value=0 label="Update Date" />
          <el-option :value=1 label="Square Meter Price" />
          <el-option :value=2 label="Square" />
          <el-option :value=3 label="Total Price" />
          <el-option :value=4 label="Renovation rating" />
          <el-option :value=6 label="Rooms Count" />
        </el-select>

        <label class="filter-label">Sort Order:</label>
        <el-select
            class="number-input"
            id="sortOrder"
            v-model="filter.sortOrder">
          <el-option :value=1 label="Ascending" />
          <el-option :value=0 label="Descending" />
        </el-select>

        <label class="filter-label">Date range:</label>
        <l-date-range-picker
            style="width: auto"
            :id="['minDate', 'maxDate']"
            v-model:min-date="filter.minDate"
            v-model:max-date="filter.maxDate"
        ></l-date-range-picker>

        <label class="filter-label">Price Range:</label>
        <l-number-range-picker
          v-model:min-value="filter.minPrice"
          v-model:max-value="filter.maxPrice"
          min-value-placeholder="Min"
          max-value-placeholder="Max"
          postfixText="M, RUB"
          :step="1"
          :min="0"
          :max="1000000"
        ></l-number-range-picker>

        <label class="filter-label">Square Range:</label>
        <l-number-range-picker
          v-model:min-value="filter.minSquare"
          v-model:max-value="filter.maxSquare"
          min-value-placeholder="Min"
          max-value-placeholder="Max"
          postfixText="m²"
          :step="5"
          :min="0"
          :max="10000"
        ></l-number-range-picker>

        <label class="filter-label">Renovation Rating Range:</label>
        <l-number-range-picker
            v-model:min-value="filter.minRenovationRating"
            v-model:max-value="filter.maxRenovationRating"
            min-value-placeholder="Min"
            max-value-placeholder="Max"
            :step="1"
            :min="0"
            :max="10"
            postfixText="1 to 10"
        ></l-number-range-picker>

        <label class="filter-label">Rooms Count:</label>
        <el-select
            class="number-input"
            id="roomsCount"
            multiple
            clearable
            v-model="filter.roomsCount">
          <el-option :value="0" label="Studio" />
          <el-option :value="1" label="1" />
          <el-option :value="2" label="2" />
          <el-option :value="3" label="3" />
          <el-option :value="4" label="4" />
        </el-select>

        <label class="filter-label">Source:</label>
        <el-select
            class="number-input"
            id="sourceType"
            clearable
            v-model="filter.source">
          <el-option value="0" label="Cian" />
          <el-option value="1" label="Avito" />
        </el-select>

        <label class="filter-label">Contains in description:</label>
        <el-input
          class="number-input"
          id="searchString"
          clearable
          v-model="filter.searchString"
        ></el-input>
      </el-aside>
    </el-collapse>

    <div class="advertisements">
      <header>
        <h1>
          <font-awesome :icon="faHome" />
          Real Estate Listings
        </h1>
        <p class="subtitle">Discover the perfect property with AI-powered insights and detailed information</p>
      </header>

      <div v-if="hasError">
        <el-alert
          title="The request finished with error. Try to change parameters."
          type="error"
          :closable="false" />
      </div>

      <div v-if="advertisements.length == 0 && hasError === false">
        <el-alert
          title="No one advertisement matches the current criteria. Try to change parameters."
          type="info"
          :closable="false" />
      </div>

      <div class="infinite-scroll grid" v-infinite-scroll="load" v-loading="hasError === null">
        <article class="property-card" v-for="item in advertisements">
          <div class="image-slider">
            <div class="image-container">
              <el-carousel :autoplay="false">
                <el-carousel-item v-for="image in item.images">
                  <el-image fit="cover" :src="image.url"/>
                </el-carousel-item>
              </el-carousel>
            </div>
          </div>

          <div class="property-info">
            <h3 class="property-title">
              <a target="_blank"
                 rel="nofollow"
                 :href="item.link">
                {{ item.sourceType == SourceType.Cian ? "Cian" : "Avito" }} #{{item.sourceId}}
              </a>
            </h3>
            <div class="property-price">
              {{ moneyFormatter.format(item.totalPrice) }}
            </div>

            <div class="address-details" v-if="item.cityName">
              <font-awesome :icon="faLocationDot" />
              {{ getAddressString(item) }}
            </div>

            <div class="property-details">
              <div class="detail-item">
                <font-awesome :icon="faRulerCombined" />
                <span>{{ item.square }} m²</span>
              </div>
              <div class="detail-item">
                <font-awesome :icon="faBed" />
                <span>{{ item.roomsCount > 0 ? item.roomsCount + ' room(s)' : 'Studio' }} </span>
              </div>
              <div class="detail-item">
                <font-awesome :icon="faMoneyBill" />
                <span>{{ moneyFormatter.format(item.squareMeterPrice) }} m²</span>
              </div>
              <div class="detail-item">
                <font-awesome :icon="faLayerGroup" />
                <span>{{ item.floorNumber }}/{{item.totalFloorsNumber }} floor</span>
              </div>
            </div>

            <div class="subway-info" v-if="item.metroStations.length > 0">
              <font-awesome :icon="faSubway" />
              <div v-for="metroStation in item.metroStations" :key="metroStation.id">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" :style="{ width: 8, height: 8 }">
                    <circle cx="3" cy="3" r="3" :fill="metroStation.color" />
                  </svg>
                  {{ metroStation.name }} - {{ metroStation.distanceInMinutes }} min {{ metroStation.distanceType == 0 ? "walk" : "by car" }}
                </div>
              </div>
            </div>

            <div class="ai-ratings">
              <div class="renovation">
                <div class="rating-label">Renovation: {{ item.renovationRating }} / 10</div>
                <div class="rating-bar">
                  <div
                    class="rating-fill"
                    :style="{
                      width: item.renovationRating * 10 + '%',
                      background: getCoefficientColor(item.renovationRating / 10)
                    }">
                  </div>
                </div>
              </div>
              <div class="market-price" v-if="item.predictedMarketPrice">
                The price is
                <span class="not-in-market" v-if="item.totalPrice > item.predictedMarketPrice">
                  {{ Math.round((item.totalPrice / item.predictedMarketPrice - 1) * 100) }}% expensive
                </span>
                <span class="in-market" v-if="item.totalPrice < item.predictedMarketPrice">
                  {{ Math.round((item.predictedMarketPrice / item.totalPrice - 1) * 100) }}% cheaper
                </span>
                than estimated {{ moneyFormatter.format(item.predictedMarketPrice) }}
              </div>
            </div>

            <div class="advantages" v-if="item.advantages.length > 0">
              <h4><i class="fas fa-thumbs-up"></i> Advantages</h4>
              <ul>
                <li v-for="advantage in item.advantages">{{ advantage }}</li>
              </ul>
            </div>

            <div class="disadvantages" v-if="item.problems.length > 0">
              <h4><i class="fas fa-exclamation-circle"></i> Disadvantages</h4>
              <ul>
                <li v-for="problem in item.problems">{{ problem }}</li>
              </ul>
            </div>

            <div class="last-update">
              <div>Updated: <span class="update-date">{{ formatDate(item.updatedAt) }}</span></div>
              <div><i class="fas fa-bell"></i> {{ item.crawledAt == item.firstTimeCrawledAt ? 'New listing' : 'Updated' }}</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>

h1 {
  margin-top: 3vh;
  font-size: 2.8rem;
  color: #2c3e50;
  margin-bottom: 10px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.1);
  text-align: center;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 700px;
  margin: 0 auto 3vh;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 3vw;
  margin-top: 20px;
}

.property-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.property-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.15);
}

.property-info {
  padding: 20px;
}

.property-price {
  font-size: 1.9rem;
  font-weight: 700;
  color: #10367c;
}

.market-price {
  font-size: 1rem;
  font-weight: 500;
  margin-top: 1.5vh;
}

.in-market {
  color: #19a614;
}

.not-in-market {
  color: #8f2214;
}

.address-details{
  margin-top: 1.5vh;
  font-size: 1rem;
  color: #000000;
}

.property-title a {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #392c50;
}

.subway-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1.5vh;
}

.property-details {
  margin-top: 2vh;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2vh;
}

.property-title {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #1a2a6c;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-ratings {
  margin-top: 2vh;
  margin-bottom: 2vh;
}

.ai-ratings .renovation {
  margin-bottom: 1vh;
}

.rating-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 5px;
}

.rating-fill {
  height: 100%;
  border-radius: 4px;
}

.advantages {
  margin-bottom: 25px;
}

.advantages h4, .disadvantages h4 {
  margin-bottom: 8px;
  color: #1a2a6c;
  display: flex;
  align-items: center;
  gap: 5px;
}

.advantages ul, .disadvantages ul {
  padding-left: 20px;
  list-style-type: disc;
}

.last-update {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.update-date {
  font-weight: 600;
  color: #2c3e50;
}

.advertisements{
  width: 66%;
  margin: 0 auto;
}

.container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.filters {
  width: 300px;
  padding: 20px;
  background-color: #f0f0f0;
  border-right: 1px solid #ccc;
}

.filter-label {
  display: block;
  margin-top: 2vh;
  margin-bottom: 1vh;
}

.filters .number-input{
  width: 100%;
}

.left-tab h3 {
  margin-bottom: 2vh;
}

.grid :deep(.el-image) {
  height: 100%;
  display: inherit;
}

.expand-button {
  width: 100%;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none; /* Hides the filters */
  }
}

@media (max-width: 1024px) {
  .advertisements{
    width: auto;
  }
  .container {
    flex-flow: column;
  }
  .filters{
    width: 100%;
  }
  .advertisement-header .right-tab{
    margin: 1vh 0;
    text-align: left;
  }
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
    margin: 10px;
  }
  h1 {
    font-size: 1.6rem;
  }
  .subtitle{
    font-size: 1rem;
  }
  .property-title a {
    font-size: 0.9rem;
  }
  .property-price {
    font-size: 1.4rem;
  }
}

</style>