using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Service.Utility.Components
{

	// --------- lớp con dùng lặp lại ----------
	public class SelfLink
	{
		[JsonPropertyName("self")]
		public string Self { get; set; } = string.Empty;
	}

	// --------- phần tử trong mảng "result" ----------
	public class ListItem
	{
		[JsonPropertyName("name")]
		public string Name { get; set; } = string.Empty;

		[JsonPropertyName("id")]
		public Guid Id { get; set; }

		[JsonPropertyName("contact_count")]
		public int ContactCount { get; set; }

		// Thuộc tính có tên "_metadata" nên dùng attribute để map
		[JsonPropertyName("_metadata")]
		public SelfLink Metadata { get; set; }  
	}

	// --------- metadata tổng ở cuối ----------
	public class ResponseMetadata : SelfLink
	{
		[JsonPropertyName("count")]
		public int Count { get; set; }
	}

	// --------- root ----------
	public class ListsResponse
	{
		[JsonPropertyName("result")]
		public List<ListItem> Result { get; set; }  

		[JsonPropertyName("_metadata")]
		public ResponseMetadata Metadata { get; set; } 
	}

	public class SendGridComponent
	{
		private string _key { get; set; }

		public SendGridComponent(string key)
		{
			_key = key;
		}

		public async Task<ListsResponse> GetList()
		{ 
			using (HttpClient client = new HttpClient())
			{
				client.BaseAddress = new Uri("https://api.sendgrid.com/v3/");
				client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _key);

				HttpResponseMessage response = await client.GetAsync("marketing/lists");
				if (response.IsSuccessStatusCode)
				{
					string responseData = await response.Content.ReadAsStringAsync();
					Console.WriteLine("Danh sách Contact Lists:");
					System.IO.File.WriteAllText("data.txt", responseData);

					ListsResponse data = 
						System.Text.Json.JsonSerializer.Deserialize<ListsResponse>(responseData, new JsonSerializerOptions
						{
							PropertyNameCaseInsensitive = false
						});

					return data;
					Console.WriteLine(responseData);
				}
				else
				{
					Console.WriteLine($"Lỗi: {response.StatusCode}");
					string error = await response.Content.ReadAsStringAsync();
					Console.WriteLine(error);
				}
			}

			return  new ListsResponse();
		}
		 
	}
}