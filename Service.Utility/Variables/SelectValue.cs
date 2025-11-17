using System;
using System.Collections.Generic;
using NPOI.HPSF;

namespace Service.Utility.Variables
{
	public class SelectValue
	{
		public int Id { get; set; }
		public string Text { get; set; }
	}

	public class BaseItem
	{
		public int Id { get; set; }
		public string Code { get; set; }
		public string Name { get; set; }
		public string MoRong { get; set; }
	}
	public class GuidBaseItem
	{
		public Guid Id { get; set; }
		public string Code { get; set; }
		public string Name { get; set; }
		public string MoRong { get; set; }
	}
	public class BaseSearchItem
	{
		public int Id { get; set; }
		public string Keyword { get; set; }
		public string Code { get; set; }
		public string Name { get; set; }
		public string MoRong { get; set; }
	}

	public class MultiLevelBaseItem
	{
		public int Id { get; set; }
		public string Code { get; set; }
		public string Name { get; set; }
		public int? ParentId { get; set; }
	}

	public class MaTrixRowItem
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public int? Priority { get; set; }
		public List<MatrixColItem> Cols { get; set; }
	}

	public class MatrixColItem
	{
		public int Id { get; set; }
		public string Col { get; set; }
		public string Value { get; set; }
	}
	public class MatrixEditCell
	{
		public int Col { get; set; }
		public string Value { get; set; }
	}
	public class MatrixEditModel
	{
		public int Id { get; set; }
		public List<MatrixEditCell> Details { get; set; }
	}
	public class BaseEmployee
	{
		public Guid Id { get; set; }
		public string StaffCode { get; set; }
		public string FullName { get; set; }
		public int? JobPositionId { get; set; }
		public int? OrganizationId { get; set; }
		public string JobPositionName { get; set; }
		public string OrganizationName { get; set; }
		public string Avatar { get; set; }
	}
}