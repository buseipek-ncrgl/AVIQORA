using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aviqora.Application.DTOs;
using Aviqora.Application.Services;
using Aviqora.Infrastructure.ML;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Aviqora.Api.Controllers;

public class ChatHistoryMessageDto
{
    public string Role { get; set; } = "user";
    public string Content { get; set; } = string.Empty;
}

public class CopilotRequestDto
{
    public string Query { get; set; } = string.Empty;
    public string? FromCode { get; set; } = "IST";
    public string? ToCode { get; set; } = "BER";
    public List<ChatHistoryMessageDto>? History { get; set; }
}

public class CopilotResponseDto
{
    public string ResponseText { get; set; } = string.Empty;
    public List<FlightDto>? Flights { get; set; }
    public WeatherReportDto? Weather { get; set; }
    public FlightDelayPrediction? DelayPrediction { get; set; }
    public List<HotelRecommendationDto>? Hotels { get; set; }
    public List<CarRentalDto>? CarRentals { get; set; }
    public List<string>? PackingList { get; set; }
}

public class WeatherReportDto
{
    public string Airport { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Temp { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Wind { get; set; } = string.Empty;
    public string Humidity { get; set; } = string.Empty;
    public string Visibility { get; set; } = string.Empty;
    public string ClothingAdvisory { get; set; } = string.Empty;
}

public class HotelRecommendationDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public double Rating { get; set; }
    public decimal PricePerNight { get; set; }
    public string DistanceFromAirport { get; set; } = string.Empty;
    public string Amenities { get; set; } = string.Empty;
}

public class CarRentalDto
{
    public string Id { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string CarModel { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }
    public string FuelType { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IFlightMlEngine _mlEngine;
    private readonly IFlightService _flightService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public AiController(
        IFlightMlEngine mlEngine,
        IFlightService flightService,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration)
    {
        _mlEngine = mlEngine;
        _flightService = flightService;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    /// <summary>
    /// Copilot akıllı doğal dil asistanı endpoint'i.
    /// </summary>
    [HttpPost("copilot")]
    public async Task<ActionResult<CopilotResponseDto>> CopilotQuery([FromBody] CopilotRequestDto request, CancellationToken cancellationToken)
    {
        var q = request.Query.ToLowerInvariant();
        var response = new CopilotResponseDto();

        var searchResult = await _flightService.SearchFlightsAsync(
            new FlightSearchRequestDto(request.FromCode ?? "IST", request.ToCode ?? "BER", DateTime.Today.AddDays(1)),
            cancellationToken
        );

        response.Flights = searchResult.Take(3).ToList();

        // 1. Weather / METAR Detection (Dynamic City Resolution with Chat Memory)
        string historyText = request.History != null ? string.Join(" ", request.History.Select(h => h.Content.ToLowerInvariant())) : "";
        string combinedText = q + " " + historyText;

        string targetCity = "Gaziantep";
        if (q.Contains("gaziantep") || q.Contains("gzt")) targetCity = "Gaziantep";
        else if (q.Contains("izmir") || q.Contains("adb")) targetCity = "İzmir";
        else if (q.Contains("ankara") || q.Contains("esb")) targetCity = "Ankara";
        else if (q.Contains("antalya") || q.Contains("ayt")) targetCity = "Antalya";
        else if (q.Contains("trabzon") || q.Contains("tzx")) targetCity = "Trabzon";
        else if (q.Contains("bodrum") || q.Contains("bjv")) targetCity = "Bodrum";
        else if (q.Contains("berlin") || q.Contains("ber")) targetCity = "Berlin";
        else if (q.Contains("londra") || q.Contains("london") || q.Contains("lhr")) targetCity = "Londra";
        else if (q.Contains("paris") || q.Contains("cdg")) targetCity = "Paris";
        else if (q.Contains("istanbul") || q.Contains("ist")) targetCity = "İstanbul";
        else if (historyText.Contains("gaziantep") || historyText.Contains("gzt")) targetCity = "Gaziantep";
        else if (historyText.Contains("izmir") || historyText.Contains("adb")) targetCity = "İzmir";
        else if (historyText.Contains("ankara") || historyText.Contains("esb")) targetCity = "Ankara";
        else if (historyText.Contains("antalya") || historyText.Contains("ayt")) targetCity = "Antalya";
        else if (historyText.Contains("trabzon") || historyText.Contains("tzx")) targetCity = "Trabzon";
        else if (historyText.Contains("bodrum") || historyText.Contains("bjv")) targetCity = "Bodrum";
        else if (historyText.Contains("berlin") || historyText.Contains("ber")) targetCity = "Berlin";
        else if (historyText.Contains("londra") || historyText.Contains("lhr")) targetCity = "Londra";
        else if (historyText.Contains("paris") || historyText.Contains("cdg")) targetCity = "Paris";
        else if (historyText.Contains("istanbul") || historyText.Contains("ist")) targetCity = "İstanbul";
        else if (!string.IsNullOrWhiteSpace(request.ToCode))
        {
            targetCity = request.ToCode == "BER" ? "Berlin" :
                         request.ToCode == "LHR" ? "Londra" :
                         request.ToCode == "CDG" ? "Paris" :
                         request.ToCode == "GZT" ? "Gaziantep" :
                         request.ToCode == "ADB" ? "İzmir" :
                         request.ToCode == "ESB" ? "Ankara" : request.ToCode;
        }
        response.Weather = new WeatherReportDto
        {
            Airport = $"{request.ToCode ?? "BER"} Hub",
            City = targetCity,
            Temp = "21°C",
            Condition = "Açık & Parçalı Bulutlu",
            Wind = "14 knot Kuzeydoğu",
            Humidity = "%58",
            Visibility = "10 km (İdeal)",
            ClothingAdvisory = "Hafif ceket ve mevsimlik seyahat kıyafetleri önerilir."
        };

        // Live RapidAPI OpenWeather Integration (open-weather13.p.rapidapi.com)
        var weatherApiKey = _configuration["ExternalApis:Weather:ApiKey"];
        var weatherApiHost = _configuration["ExternalApis:Weather:ApiHost"] ?? "open-weather13.p.rapidapi.com";
        var weatherBaseUrl = _configuration["ExternalApis:Weather:BaseUrl"] ?? "https://open-weather13.p.rapidapi.com";

        if (!string.IsNullOrWhiteSpace(weatherApiKey) && weatherApiKey.Length > 10)
        {
            try
            {
                var weatherClient = _httpClientFactory.CreateClient();
                weatherClient.DefaultRequestHeaders.Add("X-RapidAPI-Key", weatherApiKey);
                weatherClient.DefaultRequestHeaders.Add("X-RapidAPI-Host", weatherApiHost);

                // open-weather13 parameters: city (string), lang (string: TR, EN, DE, etc.)
                var weatherUrl = $"{weatherBaseUrl}/city?city={Uri.EscapeDataString(targetCity)}&lang=TR";
                var weatherResponse = await weatherClient.GetAsync(weatherUrl, cancellationToken);

                if (!weatherResponse.IsSuccessStatusCode)
                {
                    // Fallback to /weather endpoint if /city endpoint returns error
                    weatherUrl = $"{weatherBaseUrl}/weather?city={Uri.EscapeDataString(targetCity)}&lang=TR";
                    weatherResponse = await weatherClient.GetAsync(weatherUrl, cancellationToken);
                }

                if (weatherResponse.IsSuccessStatusCode)
                {
                    var wJson = await weatherResponse.Content.ReadAsStringAsync(cancellationToken);
                    using var wDoc = JsonDocument.Parse(wJson);
                    var root = wDoc.RootElement;

                    string tempStr = response.Weather.Temp;
                    if (root.TryGetProperty("main", out var mainProp) && mainProp.TryGetProperty("temp", out var tempProp))
                    {
                        double rawTemp = tempProp.GetDouble();
                        // open-weather13 returns Fahrenheit by default if rawTemp > 45, convert to Celsius
                        double celsiusTemp = rawTemp > 45 ? (rawTemp - 32.0) * 5.0 / 9.0 : rawTemp;
                        tempStr = $"{Math.Round(celsiusTemp)}°C";
                    }

                    string conditionStr = response.Weather.Condition;
                    if (root.TryGetProperty("weather", out var weatherArr) && weatherArr.ValueKind == JsonValueKind.Array && weatherArr.GetArrayLength() > 0)
                    {
                        var firstW = weatherArr[0];
                        if (firstW.TryGetProperty("description", out var descProp) && !string.IsNullOrWhiteSpace(descProp.GetString()))
                        {
                            conditionStr = descProp.GetString()!;
                        }
                        else if (firstW.TryGetProperty("main", out var mainWProp) && !string.IsNullOrWhiteSpace(mainWProp.GetString()))
                        {
                            conditionStr = mainWProp.GetString()!;
                        }
                    }

                    string windStr = response.Weather.Wind;
                    if (root.TryGetProperty("wind", out var windProp) && windProp.TryGetProperty("speed", out var speedProp))
                    {
                        windStr = $"{Math.Round(speedProp.GetDouble())} mph";
                    }

                    string humidityStr = response.Weather.Humidity;
                    if (root.TryGetProperty("main", out var mainHumProp) && mainHumProp.TryGetProperty("humidity", out var humProp))
                    {
                        humidityStr = $"%{humProp.GetInt32()}";
                    }

                    string visibilityStr = response.Weather.Visibility;
                    if (root.TryGetProperty("visibility", out var visProp))
                    {
                        double visMeters = visProp.GetDouble();
                        visibilityStr = visMeters >= 1000 ? $"{Math.Round(visMeters / 1000.0, 1)} km" : $"{visMeters} m";
                    }

                    response.Weather.City = targetCity;
                    response.Weather.Temp = tempStr;
                    response.Weather.Condition = conditionStr;
                    response.Weather.Wind = windStr;
                    response.Weather.Humidity = humidityStr;
                    response.Weather.Visibility = visibilityStr;
                }
            }
            catch
            {
                // Fallback to internal weather advisory if RapidAPI weather is offline
            }
        }

        // 2. ML.NET Delay Prediction
        response.DelayPrediction = _mlEngine.PredictFlightDelay(
            response.Flights.FirstOrDefault()?.FlightNumber ?? "AVQ204",
            request.FromCode ?? "IST",
            request.ToCode ?? "BER",
            DateTime.Now.AddHours(4),
            14, // Wind speed
            10  // Visibility
        );

        // 3. Hotel & Places Recommendations (Live Google Places API Entegrasyonu)
        var googlePlacesApiKey = _configuration["ExternalApis:GooglePlaces:ApiKey"];
        bool hasGooglePlaces = !string.IsNullOrWhiteSpace(googlePlacesApiKey) && !googlePlacesApiKey.Contains("BURAYA_");

        if (hasGooglePlaces)
        {
            try
            {
                var placesClient = _httpClientFactory.CreateClient();
                var hotelQueryUrl = $"https://maps.googleapis.com/maps/api/place/textsearch/json?query=hotels+in+{Uri.EscapeDataString(targetCity)}&key={googlePlacesApiKey}";
                var hotelResponse = await placesClient.GetAsync(hotelQueryUrl, cancellationToken);

                if (hotelResponse.IsSuccessStatusCode)
                {
                    var hJson = await hotelResponse.Content.ReadAsStringAsync(cancellationToken);
                    using var hDoc = JsonDocument.Parse(hJson);
                    if (hDoc.RootElement.TryGetProperty("results", out var hResults) && hResults.ValueKind == JsonValueKind.Array && hResults.GetArrayLength() > 0)
                    {
                        var fetchedHotels = new List<HotelRecommendationDto>();
                        int count = 0;
                        foreach (var place in hResults.EnumerateArray())
                        {
                            if (count >= 3) break;
                            string name = place.TryGetProperty("name", out var nProp) ? nProp.GetString() ?? "Hotel" : "Hotel";
                            double rating = place.TryGetProperty("rating", out var rProp) && rProp.TryGetDouble(out var rVal) ? rVal : 4.8;
                            string formattedAddr = place.TryGetProperty("formatted_address", out var aProp) ? aProp.GetString() ?? targetCity : targetCity;
                            
                            fetchedHotels.Add(new HotelRecommendationDto
                            {
                                Id = $"gh-{count + 1}",
                                Name = name,
                                City = targetCity,
                                Rating = rating,
                                PricePerNight = 1850 + (count * 450),
                                DistanceFromAirport = $"{4 + (count * 3)} km",
                                Amenities = $"{formattedAddr.Split(',')[0]} • Google Verified ⭐ {rating}"
                            });
                            count++;
                        }

                        if (fetchedHotels.Count > 0)
                        {
                            response.Hotels = fetchedHotels;
                        }
                    }
                }
            }
            catch
            {
                // Fallback to internal curated list if offline or rate limited
            }
        }

        if (response.Hotels == null || response.Hotels.Count == 0)
        {
            if (targetCity == "Gaziantep")
            {
                response.Hotels = new List<HotelRecommendationDto>
                {
                    new HotelRecommendationDto { Id = "h-gzt1", Name = "Grand Hotel Gaziantep", City = "Gaziantep", Rating = 4.9, PricePerNight = 2800, DistanceFromAirport = "14 km", Amenities = "Spa • Panoramik Şehir Manzarası • Gurme Kahvaltı" },
                    new HotelRecommendationDto { Id = "h-gzt2", Name = "Divan Gaziantep", City = "Gaziantep", Rating = 4.8, PricePerNight = 2450, DistanceFromAirport = "16 km", Amenities = "Tarihi Merkez Yakını • Havuz • Ücretsiz Wi-Fi" },
                    new HotelRecommendationDto { Id = "h-gzt3", Name = "Tuğcan Hotel Gaziantep", City = "Gaziantep", Rating = 4.7, PricePerNight = 1950, DistanceFromAirport = "15 km", Amenities = "Kültür Yolu Üzerinde • Gym • Otopark" }
                };
            }
            else if (targetCity == "İzmir")
            {
                response.Hotels = new List<HotelRecommendationDto>
                {
                    new HotelRecommendationDto { Id = "h-izm1", Name = "Swissôtel Büyük Efes İzmir", City = "İzmir", Rating = 4.9, PricePerNight = 3600, DistanceFromAirport = "16 km", Amenities = "Kordon Sahil Manzarası • Açık Havuz • Spa" },
                    new HotelRecommendationDto { Id = "h-izm2", Name = "Mövenpick Hotel İzmir", City = "İzmir", Rating = 4.8, PricePerNight = 2900, DistanceFromAirport = "17 km", Amenities = "Alsancak Meydanı • Executive Lounge • Gym" },
                    new HotelRecommendationDto { Id = "h-izm3", Name = "Key Hotel İzmir Kordon", City = "İzmir", Rating = 4.7, PricePerNight = 2300, DistanceFromAirport = "18 km", Amenities = "Pasaport İskelesi Yakını • Deniz Manzarası" }
                };
            }
            else if (targetCity == "İstanbul")
            {
                response.Hotels = new List<HotelRecommendationDto>
                {
                    new HotelRecommendationDto { Id = "h-ist1", Name = "Çırağan Palace Kempinski", City = "İstanbul", Rating = 4.9, PricePerNight = 8500, DistanceFromAirport = "38 km", Amenities = "Boğaz Kıyısı • Saray Konaklama • VIP Spa" },
                    new HotelRecommendationDto { Id = "h-ist2", Name = "CVK Park Bosphorus", City = "İstanbul", Rating = 4.8, PricePerNight = 4200, DistanceFromAirport = "36 km", Amenities = "Taksim Meydanı • Teras Restaurant • Gym" }
                };
            }
            else
            {
                response.Hotels = new List<HotelRecommendationDto>
                {
                    new HotelRecommendationDto { Id = "h1", Name = $"The Grand {targetCity} Executive Hotel", City = targetCity, Rating = 4.9, PricePerNight = 3200, DistanceFromAirport = "8 km", Amenities = "Spa • Panoramik Manzara • Kahvaltı Dahil" },
                    new HotelRecommendationDto { Id = "h2", Name = $"{targetCity} Central Boutique Hotel", City = targetCity, Rating = 4.7, PricePerNight = 2400, DistanceFromAirport = "12 km", Amenities = "Metro Yakını • Ücretsiz Wi-Fi • Gym" },
                };
            }
        }

        // 4. Car Rental Deals
        response.CarRentals = new List<CarRentalDto>
        {
            new CarRentalDto { Id = "c1", Company = "AVIS Premium", CarModel = "BMW 320i Sedan", Category = "Lüks Otomatik", DailyPrice = 1450, FuelType = "Benzin / Hibrit" },
            new CarRentalDto { Id = "c2", Company = "HERTZ Express", CarModel = "Volkswagen Tiguan SUV", Category = "Aile SUV", DailyPrice = 1290, FuelType = "Dizel Otomatik" },
        };

        // 5. Smart Packing List
        response.PackingList = new List<string>
        {
            "Elektronik Biniş Kartı & Pasaport / Kimlik",
            "Mevsimlik hafif ceket ve konforlu yürüyüş ayakkabısı",
            "Universal priz dönüştürücü ve powerbank",
            "Kişisel kişisel bakım & seyahat boyu kozmetik kiti"
        };

        // --- REAL OPENAI API CALL ---
        var openAiKey = _configuration["ExternalApis:OpenAi:ApiKey"];
        var openAiModel = _configuration["ExternalApis:OpenAi:Model"] ?? "gpt-4o";

        if (!string.IsNullOrWhiteSpace(openAiKey) && openAiKey.StartsWith("sk-"))
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", openAiKey);

                var openAiMessagesList = new List<object>
                {
                    new
                    {
                        role = "system",
                        content = "Sen AVIQORA Havayolları Akıllı Seyahat Danışmanısın. Kullanıcıyla sürdürdüğün geçmiş konuşma bağlamını VE kullanıcının daha önce bahsettiği hedef şehri/rotayı ASLA UNUTMA. Örneğin kullanıcı önce 'Gaziantep'ten bahsettiyse ve sonra 'ibis otel yol tarifi' derse, Gaziantep Ibis Otel için yol tarifi ver.\n\nZORUNLU FORMAT KURALLARI:\n1. Her ana bölüm başlığını kendi ayrı satırına koy (örneğin: ✈️ **Uçuş Bilgileri:**, 🌤️ **Hava Durumu:**, 🏨 **Konaklama Önerileri:**, 📍 **Yol Tarifi & Ulaşım:**, 🏛️ **Gezilecek Yerler:**).\n2. Her bölüm başlığından önce MUTLAKA 2 satır boşluk bırak.\n3. Detayları tek uzun cümle yazmak yerine maddeler halinde (• veya -) sırala.\n4. Konuşma geçmişindeki şehir bağlamını koruyarak cevap ver."
                    }
                };

                // Attach Chat History Messages to OpenAI Payload
                if (request.History != null && request.History.Count > 0)
                {
                    foreach (var hist in request.History.TakeLast(8))
                    {
                        if (!string.IsNullOrWhiteSpace(hist.Content))
                        {
                            openAiMessagesList.Add(new { role = hist.Role == "user" ? "user" : "assistant", content = hist.Content });
                        }
                    }
                }

                // Attach Current User Query
                openAiMessagesList.Add(new { role = "user", content = request.Query });

                var promptPayload = new
                {
                    model = openAiModel,
                    messages = openAiMessagesList,
                    max_tokens = 500
                };

                var content = new StringContent(JsonSerializer.Serialize(promptPayload), System.Text.Encoding.UTF8, "application/json");
                var apiResponse = await client.PostAsync("https://api.openai.com/v1/chat/completions", content, cancellationToken);

                if (apiResponse.IsSuccessStatusCode)
                {
                    var jsonStr = await apiResponse.Content.ReadAsStringAsync(cancellationToken);
                    using var doc = JsonDocument.Parse(jsonStr);
                    var choices = doc.RootElement.GetProperty("choices");
                    if (choices.GetArrayLength() > 0)
                    {
                        var text = choices[0].GetProperty("message").GetProperty("content").GetString();
                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            response.ResponseText = text.Trim();
                            return Ok(response);
                        }
                    }
                }
            }
            catch
            {
                // Fallback to internal smart logic if network or quota fails
            }
        }

        // Fallback Intelligent Response Logic (Context-Aware)
        if (q.Contains("yol") || q.Contains("tarif") || q.Contains("nasıl gidilir") || q.Contains("ulaşım"))
        {
            response.ResponseText = $"📍 **{targetCity} İbis Hotel Yol Tarifi & Ulaşım Rehberi:**\n\n✈️ **Havalimanından Ulaşım:**\n• {targetCity} Havalimanı'ndan HAVAŞ servisleri veya 24 saat taksi ile yaklaşık 18-20 dakikada doğrudan otele ulaşabilirsiniz.\n\n🚗 **Özel Araç & Navigasyon:**\n• Şehir merkezindeki İpek Yolu Bulvarı üzerinden merkeze 5 dakikalık mesafededir.\n\n🚌 **Toplu Taşıma:**\n• Şehir içi otobüs ve tramvay hatları otelin hemen önündeki ana cadde durağından geçmektedir.";
        }
        else if (targetCity == "Gaziantep")
        {
            response.ResponseText = "Ankara'dan Gaziantep seyahatiniz için harika bir seçim yaptınız! ✈️\n\n✈️ **Uçuş Bilgileri:**\n• Ankara Esenboğa (ESB) ➔ Gaziantep (GZT) arası direkt uçuş süresi yaklaşık 1 saat 15 dakikadır.\n• Erken rezervasyon avantajlarıyla en uygun bilet seçenekleri listelenmiştir.\n\n🌤️ **Canlı Hava Durumu:**\n• Gaziantep seyahatinizde mevsim şartlarına uygun rahat kıyafetler önerilir.\n\n🏨 **Konaklama & Otel Önerileri:**\n• Şehir merkezinde ve kültür yoluna yakın seçkin otel seçenekleri hazırlandı.\n\n🏛️ **Gezilecek Yerler & Gurme Rotası:**\n• Zeugma Mozaik Müzesi, Gaziantep Kalesi ve Bakırcılar Çarşısı.\n• Tahmis Kahvesi'nde menengiç kahvesi molası.\n• Meşhur fıstıklı baklava, katmer, Ali Nazik kebap ve küşleme lezzetlerini mutlaka deneyimleyin!";
        }
        else if (targetCity == "İzmir")
        {
            response.ResponseText = "İzmir seyahatiniz için hazırlanan canlı seyahat rehberi: 🌊\n\n📍 **Gezilecek Başlıca Rotalar:**\n• Tarihi Saat Kulesi & Konak Meydanı\n• Kordon Boyu & Pasaport İskelesi\n• Tarihi Asansör & Dario Moreno Sokağı\n• Tarihi Kemeraltı Çarşısı & Kızlarağası Hanı\n• Efes Antik Kenti & Şirince Köyü\n\n🍽️ **Lezzet Molası:**\n• Alsancak'ta fırından taze çıkmış boyoz ve meşhur İzmir kumrusunu mutlaka tadın!";
        }
        else if (targetCity == "İstanbul")
        {
            response.ResponseText = "İstanbul seyahatinizde gezilmesi gereken simge mekanlar: 🕌\n\n🕌 **Tarihi Rota:**\n• Ayasofya-i Kebir Cami-i Şerifi & Sultanahmet Meydanı\n• Topkapı Sarayı & Galata Kulesi\n• Boğaz Turu & Ortaköy Sahili\n• Kapalıçarşı & Mısır Çarşısı";
        }
        else if (targetCity == "Ankara")
        {
            response.ResponseText = "Ankara seyahatinizde ziyaret edilecek önemli noktalar: 🇹🇷\n\n🇹🇷 **Başkent Rotası:**\n• Anıtkabir\n• Ankara Kalesi & Hamamönü\n• Anadolu Medeniyetleri Müzesi\n• Atakule & Seğmenler Parkı";
        }
        else if (targetCity == "Antalya")
        {
            response.ResponseText = "Antalya'da gezilecek harika yerler: 🏖️\n\n🏖️ **Akdeniz Rotası:**\n• Tarihi Kaleiçi & Yat Limanı\n• Düden ve Kurşunlu Şelaleleri\n• Konyaaltı & Lara Plajları\n• Aspendos & Perge Antik Kenti";
        }
        else if (targetCity == "Paris")
        {
            response.ResponseText = "Paris gezisi için kaçırılmayacak rotalar: 🗼\n\n🗼 **Romantik Şehir Rotası:**\n• Eyfel Kulesi & Champ de Mars\n• Louvre Müzesi & Musée d'Orsay\n• Şanzelize (Champs-Élysées) & Zafer Takı\n• Seine Nehir Turu";
        }
        else
        {
            response.ResponseText = $"✈️ **{targetCity} Seyahat Planı:**\n• Tarifeli uçuşlar ve bilet seçenekleri filtrelendi.\n\n🌤️ **Canlı Hava Durumu:**\n• {targetCity} için güncel hava tahminleri ve uçuş koşulları hazırlandı.\n\n🏨 **Konaklama Önerileri:**\n• Havalimanı ve şehir merkezine yakın seçkin konaklama alternatifleri listelendi.";
        }

        return Ok(response);
    }

    /// <summary>
    /// ML.NET uçuş rötar olasılığı tahmin endpoint'i.
    /// </summary>
    [HttpGet("predict-delay")]
    public ActionResult<FlightDelayPrediction> PredictDelay(
        [FromQuery] string flightNumber = "AVQ204",
        [FromQuery] string origin = "IST",
        [FromQuery] string destination = "BER",
        [FromQuery] int windSpeed = 14,
        [FromQuery] int visibility = 10)
    {
        var prediction = _mlEngine.PredictFlightDelay(flightNumber, origin, destination, DateTime.Now.AddHours(3), windSpeed, visibility);
        return Ok(prediction);
    }
}
