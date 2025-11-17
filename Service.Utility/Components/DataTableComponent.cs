using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.IO;
using System.Linq;
using System.Web;
using ClosedXML.Excel;

namespace Service.Utility.Components
{
    public class EColumn
    {
        public Type Type { get; set; }
        public string Caption { get; set; }
    }

    public class ConvertDataTable
    {
        public DataTable DataTable { get; set; }
        public string Error { get; set; }
    }
    public class DataTableComponent
    {
        public DataTable Table { get; set; }

        public DataTableComponent()
        {
            Table = new DataTable()
            {
                TableName = Guid.NewGuid().ToString().Substring(0, 10)
            };
        }
        public DataTableComponent(string tableName)
        {
            Table = new DataTable()
            {
                TableName = tableName
            };
        }

        public void Renew(string tableName)
        {
            Table = new DataTable()
            {
                TableName = !string.IsNullOrEmpty(tableName) ? tableName : Guid.NewGuid().ToString().Substring(0, 10)
            };
        }
        public void AddColumns(List<EColumn> cols)
        {
            foreach (var col in cols)
            {
                var dc = new DataColumn("C" + Table.Columns.Count, col.Type);
                if (!string.IsNullOrEmpty(col.Caption))
                {
                    dc.Caption = col.Caption;
                }
                Table.Columns.Add(dc);
            }
        }

        public DataRow AddRow(string[] data)
        {
            var row = Table.NewRow();

            for (var i = 0; i < Table.Columns.Count; i++)
            {
                var c = Table.Columns[i];
                if (c.DataType == typeof(Int32))
                {
                    row[Table.Columns[i]] = Int32.Parse(data[i]);
                }
                else if (c.DataType == typeof(double))
                {
                    row[Table.Columns[i]] = double.Parse(data[i]);
                }
                else
                {
                    row[Table.Columns[i]] = data[i];
                }
            }
            Table.Rows.Add(row);
            return row;
        }


        public void Export(string fileName, HttpResponseBase response)
        {
            using (XLWorkbook wb = new XLWorkbook())
            {
                var ws = wb.Worksheets.Add(Table);
                var firstOrDefault = ws.Tables.FirstOrDefault();
                if (firstOrDefault != null) firstOrDefault.ShowAutoFilter = false;
                wb.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                wb.Style.Font.Bold = true;
                response.Clear();
                response.Buffer = true;
                response.Charset = "";
                response.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                response.AddHeader("content-disposition", "attachment;filename= " + fileName);
                using (MemoryStream mm = new MemoryStream())
                {
                    wb.SaveAs(mm);
                    mm.WriteTo(response.OutputStream);
                    response.Flush();
                    response.End();
                }
            }
        }

        public void SaveAs(string path)
        {
            using (XLWorkbook wb = new XLWorkbook())
            {
                var ws = wb.Worksheets.Add(Table);
                var firstOrDefault = ws.Tables.FirstOrDefault();
                if (firstOrDefault != null) firstOrDefault.ShowAutoFilter = false;
                wb.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                wb.Style.Font.Bold = true;
                wb.SaveAs(path);
            }
        }

        public ConvertDataTable ConvertCSVtoDataTable(string strFilePath)
        {
            var result = new ConvertDataTable();
            try
            {
                using (StreamReader sr = new StreamReader(strFilePath))
                {
                    string[] headers = sr.ReadLine().Split(',');
                    foreach (string header in headers)
                    {
                        result.DataTable.Columns.Add(header);
                    }
                    while (!sr.EndOfStream)
                    {
                        string[] rows = sr.ReadLine().Split(',');
                        if (rows.Length > 1)
                        {
                            DataRow dr = result.DataTable.NewRow();
                            for (int i = 0; i < headers.Length; i++)
                            {
                                dr[i] = rows[i].Trim();
                            }
                            result.DataTable.Rows.Add(dr);
                        }
                    }
                }
            }
            catch (Exception e)
            {
                result.Error = e.Message;
            }
            

            return result;
        }
        public ConvertDataTable ConvertXSLXtoDataTable(string strFilePath, string connString)
        {
            OleDbConnection oledbConn = new OleDbConnection(connString);
            var result = new ConvertDataTable();
            try
            {

                oledbConn.Open();
                using (OleDbCommand cmd = new OleDbCommand("SELECT * FROM [Sheet1$]", oledbConn))
                {
                    OleDbDataAdapter oleda = new OleDbDataAdapter();
                    oleda.SelectCommand = cmd;
                    DataSet ds = new DataSet();
                    oleda.Fill(ds);

                    result.DataTable = ds.Tables[0];
                }
            }
            catch(Exception e)
            {
                result.Error = e.Message;
            }
            finally
            {
                oledbConn.Close();
            }
            return result;
        }
    }

}