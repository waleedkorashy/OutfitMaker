namespace OutFitMaker.API.Utilities;

public class AiApiOptions
{
    public const string SectionName = "AI";

    public string PredictionUrl { get; set; } = "http://localhost:5000/predict";

    public string RecommendationUrl { get; set; } = "http://127.0.0.1:5000/recommend";
}